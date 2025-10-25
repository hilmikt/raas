const EscrowAbi = [
  {
    type: "function",
    name: "createMilestone",
    inputs: [
      { name: "worker", type: "address", internalType: "address" },
      { name: "amount", type: "uint256", internalType: "uint256" },
      { name: "ref", type: "bytes32", internalType: "bytes32" },
      { name: "rail", type: "uint8", internalType: "enum Escrow.Rail" },
    ],
    outputs: [{ name: "id", type: "uint256", internalType: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "fund",
    inputs: [{ name: "id", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "release",
    inputs: [
      { name: "id", type: "uint256", internalType: "uint256" },
      { name: "kiraPayRef", type: "bytes", internalType: "bytes" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "cancel",
    inputs: [{ name: "id", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "MilestoneCreated",
    inputs: [
      { name: "id", type: "uint256", indexed: true, internalType: "uint256" },
      { name: "client", type: "address", indexed: true, internalType: "address" },
      { name: "worker", type: "address", indexed: true, internalType: "address" },
      { name: "amount", type: "uint256", indexed: false, internalType: "uint256" },
      { name: "ref", type: "bytes32", indexed: false, internalType: "bytes32" },
      { name: "rail", type: "uint8", indexed: false, internalType: "enum Escrow.Rail" },
    ],
  },
  {
    type: "event",
    name: "Funded",
    inputs: [
      { name: "id", type: "uint256", indexed: true, internalType: "uint256" },
      { name: "from", type: "address", indexed: true, internalType: "address" },
      { name: "amount", type: "uint256", indexed: false, internalType: "uint256" },
    ],
  },
  {
    type: "event",
    name: "Released",
    inputs: [
      { name: "id", type: "uint256", indexed: true, internalType: "uint256" },
      { name: "to", type: "address", indexed: true, internalType: "address" },
      { name: "amount", type: "uint256", indexed: false, internalType: "uint256" },
      { name: "rail", type: "uint8", indexed: false, internalType: "enum Escrow.Rail" },
    ],
  },
  {
    type: "event",
    name: "Canceled",
    inputs: [{ name: "id", type: "uint256", indexed: true, internalType: "uint256" }],
  },
] as const;

export default EscrowAbi;
