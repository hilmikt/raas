// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IPaymentRail {
    /// @dev Emitted by payment rails on successful "settlement" (onchain or anchored offchain).
    event RailSettled(address indexed escrow, address indexed payer, address indexed payee, uint256 amount, bytes32 ref, bytes extra);

    /// @notice Escrow calls this to settle a payout.
    /// @param escrow The escrow contract invoking the rail (msg.sender should be `escrow`).
    /// @param to     Recipient of the settlement.
    /// @param amount Amount to settle (token units for ERC20, atomic units for others).
    /// @param ref    A milestone or invoice reference id (32 bytes).
    /// @param extra  Rail-specific data (e.g., offchain payment id bytes, memo, etc).
    function settle(address escrow, address to, uint256 amount, bytes32 ref, bytes calldata extra) external;
}
