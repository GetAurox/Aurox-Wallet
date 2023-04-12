import { Simulation } from "common/types";

type BlocknativeSimulatorMock = Partial<Record<Simulation.ContractType, { apiResponse: any; simulatorResponse: any }>>;

export const blocknativeSimulatorMocks: BlocknativeSimulatorMock = {
  erc721: undefined,
  native: undefined,
  erc1155: undefined,
  unknown: undefined,
  erc20: {
    apiResponse: {
      "status": "simulated",
      "simulatedBlockNumber": -1,
      "transactions": [
        {
          "from": "0xdf40aeba2e9907e900089bccf929ffccd8fa4e0b",
          "to": "0xef1c6e67703c7bd7107eed8303fbe6ec2554bf6b",
          "value": 1000000,
          "gas": 200000,
          "input": "0x",
          "type": 2,
          "maxFeePerGas": 53000000000,
          "maxPriorityFeePerGas": 2.14,
        },
        {
          "from": "0xdf40aeba2e9907e900089bccf929ffccd8fa4e0b",
          "to": "0xef1c6e67703c7bd7107eed8303fbe6ec2554bf6b",
          "value": 0,
          "gas": 200000,
          "input":
            "0x3593564c000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000642a962b00000000000000000000000000000000000000000000000000000000000000030a080c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000001e000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000000160000000000000000000000000c6dddb5bc6e61e0841c54f3e723ae1f3a807260b000000000000000000000000ffffffffffffffffffffffffffffffffffffffff0000000000000000000000000000000000000000000000000000000064521bfa0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000ef1c6e67703c7bd7107eed8303fbe6ec2554bf6b00000000000000000000000000000000000000000000000000000000642a960200000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000041c34118f49c6814ab742ab121ae8cbe034d8b4356c7512e38826b8300ce79f5c872aa0ba565b116613603f4f9931675c135bd05f6b31c7d9dfad1bb3752feba341c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000045287ec4fca2aaaa00000000000000000000000000000000000000000000000000a23c84d061acb700000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000002000000000000000000000000c6dddb5bc6e61e0841c54f3e723ae1f3a807260b000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000a23c84d061acb7",
          "type": 2,
          "maxFeePerGas": 53000000000,
          "maxPriorityFeePerGas": 2.14,
        },
      ],
      "gasUsed": [21062, 162050],
      "internalTransactions": [
        [],
        [
          {
            "type": "CALL",
            "from": "0xef1c6e67703c7bd7107eed8303fbe6ec2554bf6b",
            "to": "0x000000000022d473030f116ddee9f6b43ac78ba3",
            "input":
              "0x2b67b570000000000000000000000000df40aeba2e9907e900089bccf929ffccd8fa4e0b000000000000000000000000c6dddb5bc6e61e0841c54f3e723ae1f3a807260b000000000000000000000000ffffffffffffffffffffffffffffffffffffffff0000000000000000000000000000000000000000000000000000000064521bfa0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000ef1c6e67703c7bd7107eed8303fbe6ec2554bf6b00000000000000000000000000000000000000000000000000000000642a960200000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000041c34118f49c6814ab742ab121ae8cbe034d8b4356c7512e38826b8300ce79f5c872aa0ba565b116613603f4f9931675c135bd05f6b31c7d9dfad1bb3752feba341c00000000000000000000000000000000000000000000000000000000000000",
            "gas": 158224,
            "gasUsed": 30786,
            "value": "0",
          },
          {
            "type": "CALL",
            "from": "0xef1c6e67703c7bd7107eed8303fbe6ec2554bf6b",
            "to": "0x000000000022d473030f116ddee9f6b43ac78ba3",
            "input":
              "0x36c78516000000000000000000000000df40aeba2e9907e900089bccf929ffccd8fa4e0b000000000000000000000000ebd54ad6c1d4b079bdc20ecf36dd29d1d76c997700000000000000000000000000000000000000000000000045287ec4fca2aaaa000000000000000000000000c6dddb5bc6e61e0841c54f3e723ae1f3a807260b",
            "gas": 124613,
            "gasUsed": 23886,
            "value": "0",
          },
          {
            "type": "CALL",
            "from": "0x000000000022d473030f116ddee9f6b43ac78ba3",
            "to": "0xc6dddb5bc6e61e0841c54f3e723ae1f3a807260b",
            "input":
              "0x23b872dd000000000000000000000000df40aeba2e9907e900089bccf929ffccd8fa4e0b000000000000000000000000ebd54ad6c1d4b079bdc20ecf36dd29d1d76c997700000000000000000000000000000000000000000000000045287ec4fca2aaaa",
            "gas": 119087,
            "gasUsed": 20179,
            "value": "0",
            "contractCall": {
              "methodName": "transferFrom",
              "params": {
                "_from": "0xdf40aeba2e9907e900089bccf929ffccd8fa4e0b",
                "_to": "0xebd54ad6c1d4b079bdc20ecf36dd29d1d76c9977",
                "_value": "4983372372202662570",
              },
              "contractAddress": "0xc6dddb5bc6e61e0841c54f3e723ae1f3a807260b",
              "contractType": "erc20",
              "contractAlias": "URUS",
              "contractDecimals": 18,
              "contractName": "Aurox Token",
              "decimalValue": "4.98337237220266257",
            },
          },
          {
            "type": "CALL",
            "from": "0xef1c6e67703c7bd7107eed8303fbe6ec2554bf6b",
            "to": "0xebd54ad6c1d4b079bdc20ecf36dd29d1d76c9977",
            "input":
              "0x022c0d9f00000000000000000000000000000000000000000000000000aa59250e00288d0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000ef1c6e67703c7bd7107eed8303fbe6ec2554bf6b00000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000000",
            "gas": 86868,
            "gasUsed": 60448,
            "value": "0",
          },
          {
            "type": "CALL",
            "from": "0xebd54ad6c1d4b079bdc20ecf36dd29d1d76c9977",
            "to": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            "input":
              "0xa9059cbb000000000000000000000000ef1c6e67703c7bd7107eed8303fbe6ec2554bf6b00000000000000000000000000000000000000000000000000aa59250e00288d",
            "gas": 74806,
            "gasUsed": 27962,
            "value": "0",
            "contractCall": {
              "methodName": "transfer",
              "params": {
                "_to": "0xef1c6e67703c7bd7107eed8303fbe6ec2554bf6b",
                "_value": "47948761724364941",
              },
              "contractAddress": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
              "contractType": "erc20",
              "contractAlias": "WETH",
              "contractDecimals": 18,
              "contractName": "Wrapped Ether",
              "decimalValue": "0.047948761724364941",
            },
          },
          {
            "type": "CALL",
            "from": "0xef1c6e67703c7bd7107eed8303fbe6ec2554bf6b",
            "to": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            "input": "0x2e1a7d4d00000000000000000000000000000000000000000000000000aa59250e00288d",
            "gas": 23715,
            "gasUsed": 9202,
            "value": "0",
          },
          {
            "type": "CALL",
            "from": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            "to": "0xef1c6e67703c7bd7107eed8303fbe6ec2554bf6b",
            "input": "0x",
            "gas": 2300,
            "gasUsed": 62,
            "value": "47948761724364941",
          },
          {
            "type": "CALL",
            "from": "0xef1c6e67703c7bd7107eed8303fbe6ec2554bf6b",
            "to": "0xdf40aeba2e9907e900089bccf929ffccd8fa4e0b",
            "input": "0x",
            "gas": 7810,
            "gasUsed": 0,
            "value": "47948761724364941",
          },
        ],
      ],
      "netBalanceChanges": [
        [],
        [
          {
            "address": "0xdf40aeba2e9907e900089bccf929ffccd8fa4e0b",
            "balanceChanges": [
              {
                "delta": "-4983372372202662570",
                "asset": {
                  "type": "erc20",
                  "symbol": "URUS",
                  "contractAddress": "0xc6dddb5bc6e61e0841c54f3e723ae1f3a807260b",
                },
                "breakdown": [
                  {
                    "counterparty": "0xebd54ad6c1d4b079bdc20ecf36dd29d1d76c9977",
                    "amount": "-4983372372202662570",
                  },
                ],
              },
              {
                "delta": "47948761724364941",
                "asset": {
                  "type": "ether",
                  "symbol": "ETH",
                },
                "breakdown": [
                  {
                    "counterparty": "0xef1c6e67703c7bd7107eed8303fbe6ec2554bf6b",
                    "amount": "47948761724364941",
                  },
                ],
              },
            ],
          },
          {
            "address": "0xebd54ad6c1d4b079bdc20ecf36dd29d1d76c9977",
            "balanceChanges": [
              {
                "delta": "4983372372202662570",
                "asset": {
                  "type": "erc20",
                  "symbol": "URUS",
                  "contractAddress": "0xc6dddb5bc6e61e0841c54f3e723ae1f3a807260b",
                },
                "breakdown": [
                  {
                    "counterparty": "0xdf40aeba2e9907e900089bccf929ffccd8fa4e0b",
                    "amount": "4983372372202662570",
                  },
                ],
              },
              {
                "delta": "-47948761724364941",
                "asset": {
                  "type": "erc20",
                  "symbol": "WETH",
                  "contractAddress": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
                },
                "breakdown": [
                  {
                    "counterparty": "0xef1c6e67703c7bd7107eed8303fbe6ec2554bf6b",
                    "amount": "-47948761724364941",
                  },
                ],
              },
            ],
          },
          {
            "address": "0xef1c6e67703c7bd7107eed8303fbe6ec2554bf6b",
            "balanceChanges": [
              {
                "delta": "47948761724364941",
                "asset": {
                  "type": "erc20",
                  "symbol": "WETH",
                  "contractAddress": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
                },
                "breakdown": [
                  {
                    "counterparty": "0xebd54ad6c1d4b079bdc20ecf36dd29d1d76c9977",
                    "amount": "47948761724364941",
                  },
                ],
              },
            ],
          },
          {
            "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            "balanceChanges": [
              {
                "delta": "-47948761724364941",
                "asset": {
                  "type": "ether",
                  "symbol": "ETH",
                },
                "breakdown": [
                  {
                    "counterparty": "0xef1c6e67703c7bd7107eed8303fbe6ec2554bf6b",
                    "amount": "-47948761724364941",
                  },
                ],
              },
            ],
          },
        ],
      ],
      "error": [],
      "simDetails": {
        "blockNumber": -1,
        "performanceProfile": {
          "breakdown": [
            {
              "label": "detected",
              "timeStamp": "2023-04-03T08:35:24.550Z",
            },
            {
              "label": "traceStart",
              "timeStamp": "2023-04-03T08:35:24.552Z",
            },
            {
              "label": "traceEnd",
              "timeStamp": "2023-04-03T08:35:24.614Z",
            },
            {
              "label": "dispatch",
              "timeStamp": "2023-04-03T08:35:24.614Z",
            },
          ],
        },
        "e2eMs": 64,
      },
      "serverVersion": "0.161.0",
      "system": "ethereum",
      "network": "main",
      "contractCall": [
        {
          "status": "fulfilled",
          "value": null,
        },
        {
          "status": "fulfilled",
          "value": null,
        },
      ],
    },
    simulatorResponse: {
      "simulator": "blocknative",
      "balanceChanges": [
        [
          {
            "amount": "4983372372202662570",
            "contractSymbol": "URUS",
            "contractType": "erc20",
            "contractMethod": "transferFrom",
            "contractAddress": "0xc6dddb5bc6e61e0841c54f3e723ae1f3a807260b",
            "contractDecimals": 18,
            "contractName": "Aurox Token",
            "decimalAmount": 4.983372372202663,
            "direction": "out",
          },
          {
            "amount": "47948761724364941",
            "contractSymbol": "ETH",
            "contractType": "ether",
            "direction": "in",
            "contractMethod": "NATIVE_TRANSFER",
            "type": "native",
            "contractAddress": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
            "contractDecimals": 18,
            "decimalAmount": 0.04794876172436494,
          },
        ],
      ],
      "gasUsed": [162050],
      "success": true,
    },
  },
};
