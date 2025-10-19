// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IPaymentRail} from "../interfaces/IPaymentRail.sol";

/// @notice Minimal rail that moves PYUSD (or any ERC20) sitting in the Escrow's balance.
///         The Escrow pre-approves this rail to spend its PYUSD. On settlement we transferFrom(escrow -> payee).
contract PYUSDHandler is IPaymentRail {
    IERC20 public immutable token; // PYUSD (mainnet: 0x6c3e..., Sepolia: 0xCaC5...)
    mapping(address => bool) public isEscrowAllowed;

    error NotAuthorizedEscrow();
    error TransferFailed();

    constructor(address _token) {
        require(_token != address(0), "token=0");
        token = IERC20(_token);
    }

    /// @notice Escrow factory/owner should allow the canonical Escrow.
    function allowEscrow(address escrow, bool allowed) external {
        // keep simple: anyone can allow their own escrow; misuse doesn't move *their* funds.
        // If you want stricter control, gate this via Ownable/AccessControl.
        isEscrowAllowed[escrow] = allowed;
    }

    function settle(address escrow, address to, uint256 amount, bytes32 ref, bytes calldata extra) external override {
        if (!isEscrowAllowed[msg.sender]) revert NotAuthorizedEscrow();

        // Pull funds from the escrow balance -> recipient.
        // Requires: IERC20(token).allowance(escrow, address(this)) >= amount AND escrow has `amount` balance.
        bool ok = token.transferFrom(escrow, to, amount);
        if (!ok) revert TransferFailed();

        emit RailSettled(escrow, escrow, to, amount, ref, extra);
    }
}
