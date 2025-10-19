// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IPaymentRail} from "../interfaces/IPaymentRail.sol";
import {Reputation} from "../reputation/Reputation.sol";

/// @notice Milestone-based escrow with dual-rail payouts:
///         - PYUSD (ERC20) via PYUSDHandler (onchain transfer)
///         - KIRAPAY via offchain adapter anchor (no token move, only proof)
contract Escrow is AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant ARBITER_ROLE = keccak256("ARBITER_ROLE");

    IERC20  public immutable pyusd;        // used only for allowance & funding checks
    IPaymentRail public immutable pyusdRail;
    IPaymentRail public immutable kiraPayRail;
    Reputation public immutable reputation;

    enum Rail { PYUSD, KIRAPAY }

    struct Milestone {
        address client;
        address worker;
        uint256 amount;       // PYUSD units (6 or 18 depending, PYUSD is 6 decimals on mainnet; Sepolia proxy follows PYUSD decimals)
        bytes32 ref;          // external reference/id for the work unit
        Rail    rail;         // chosen rail
        bool    funded;
        bool    released;
        bool    canceled;
    }

    uint256 public nextId;
    mapping(uint256 => Milestone) public milestones;

    event MilestoneCreated(uint256 indexed id, address indexed client, address indexed worker, uint256 amount, bytes32 ref, Rail rail);
    event Funded(uint256 indexed id, address indexed from, uint256 amount);
    event Released(uint256 indexed id, address indexed to, uint256 amount, Rail rail);
    event Canceled(uint256 indexed id);

    error NotClient();
    error NotArbiter();
    error InvalidState();
    error WrongAmount();
    error RailMismatch();

    constructor(
        address _pyusdToken,
        address _pyusdRail,
        address _kiraPayRail,
        address _reputation
    ) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ARBITER_ROLE, msg.sender);

        pyusd = IERC20(_pyusdToken);
        pyusdRail = IPaymentRail(_pyusdRail);
        kiraPayRail = IPaymentRail(_kiraPayRail);
        reputation = Reputation(_reputation);

        // Pre-approve rails to move funds *from this escrow* when releasing.
        // Use max allowance to avoid repeat approvals.
        pyusd.approve(_pyusdRail, type(uint256).max);
    }

    // --- lifecycle ---

    function createMilestone(address worker, uint256 amount, bytes32 ref, Rail rail) external whenNotPaused returns (uint256 id) {
        require(worker != address(0) && msg.sender != worker, "bad worker");
        require(amount > 0, "amount=0");

        id = ++nextId;
        milestones[id] = Milestone({
            client: msg.sender,
            worker: worker,
            amount: amount,
            ref: ref,
            rail: rail,
            funded: false,
            released: false,
            canceled: false
        });

        emit MilestoneCreated(id, msg.sender, worker, amount, ref, rail);
    }

    /// @notice Client funds the milestone in PYUSD (pulled from client -> this Escrow).
    ///         Requires prior `pyusd.approve(escrow, amount)` by the client.
    function fund(uint256 id) external nonReentrant whenNotPaused {
        Milestone storage m = milestones[id];
        if (m.client == address(0) || m.canceled) revert InvalidState();
        if (msg.sender != m.client) revert NotClient();
        if (m.funded) revert InvalidState();

        bool ok = pyusd.transferFrom(msg.sender, address(this), m.amount);
        require(ok, "fund xfer failed");

        m.funded = true;
        emit Funded(id, msg.sender, m.amount);
    }

    /// @notice Release funds / anchor payout depending on rail.
    /// @param id milestone id
    /// @param kiraPayRef bytes field for KIRAPAY offchain reference (ignored for PYUSD)
    function release(uint256 id, bytes calldata kiraPayRef) external nonReentrant whenNotPaused {
        Milestone storage m = milestones[id];
        if (m.client == address(0) || m.canceled || m.released == true) revert InvalidState();
        if (msg.sender != m.client && !hasRole(ARBITER_ROLE, msg.sender)) revert NotArbiter();

        if (m.rail == Rail.PYUSD) {
            if (!m.funded) revert InvalidState();
            // Moves PYUSD from this escrow to worker via rail.
            pyusdRail.settle(address(this), m.worker, m.amount, m.ref, "");
            m.released = true;
            emit Released(id, m.worker, m.amount, m.rail);
            reputation.recordSettlement(m.client, m.worker, m.amount, m.ref, true);
        } else if (m.rail == Rail.KIRAPAY) {
            // No onchain funds move; anchor the offchain completion id.
            kiraPayRail.settle(address(this), m.worker, m.amount, m.ref, kiraPayRef);
            m.released = true;
            emit Released(id, m.worker, m.amount, m.rail);
            reputation.recordSettlement(m.client, m.worker, m.amount, m.ref, false);
        } else {
            revert RailMismatch();
        }
    }

    /// @notice Client can cancel before funding or before release (arbiter can also cancel).
    function cancel(uint256 id) external whenNotPaused {
        Milestone storage m = milestones[id];
        if (m.client == address(0) || m.canceled || m.released) revert InvalidState();
        if (msg.sender != m.client && !hasRole(ARBITER_ROLE, msg.sender)) revert NotArbiter();

        // If already funded, refund to client.
        if (m.funded && m.rail == Rail.PYUSD) {
            // escrow still holds funds; send back to client directly (no rail needed)
            require(pyusd.transfer(m.client, m.amount), "refund failed");
        }

        m.canceled = true;
        emit Canceled(id);
    }

    // Admin controls
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) { _unpause(); }
}
