// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IMedicalCampaign {
    function creditDonation(
        address donor,
        uint256 amount,
        string calldata sourceChain
    ) external;
}
