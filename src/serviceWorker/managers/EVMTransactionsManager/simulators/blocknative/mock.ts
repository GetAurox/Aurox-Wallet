import { Simulation } from "common/types";

type BlocknativeSimulatorMock = Partial<Record<Simulation.ContractType, { apiResponse: any; simulatorResponse: any }>>;

export const blocknativeSimulatorMocks: BlocknativeSimulatorMock = {
  erc721: undefined,
  native: undefined,
  erc1155: undefined,
  unknown: {
    apiResponse: {
      "status": "simulated",
      "simulatedBlockNumber": 17030647,
      "transactions": [
        {
          "from": "0x0000000000000000000000000000000000000000",
          "to": "0x5DbcC5267d8F7f9905D1C404d1160268DeA0B5ea",
          "value": 1000000000000000000,
          "gas": 21000,
          "input": "0x",
          "type": 2,
          "maxFeePerGas": 24935288211,
          "maxPriorityFeePerGas": 170000000,
        },
        {
          "from": "0x5DbcC5267d8F7f9905D1C404d1160268DeA0B5ea",
          "to": "0x6b175474e89094c44da98b954eedeac495271d0f",
          "value": 0,
          "gas": 51104,
          "input":
            "0x095ea7b3000000000000000000000000c65f7b26a7bba778efd39641c46599bbdbecccf7ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
          "type": 2,
          "maxFeePerGas": 49870576422,
          "maxPriorityFeePerGas": 170000000,
        },
        {
          "from": "0x5DbcC5267d8F7f9905D1C404d1160268DeA0B5ea",
          "to": "0xC65F7B26a7bBa778efD39641C46599bBDBEcCCf7",
          "value": 0,
          "gas": 500000,
          "input":
            "0x9ca519c60000000000000000000000006b175474e89094c44da98b954eedeac495271d0f000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee00000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111111254fb6c44bac0bed2854e76f90643097d000000000000000000000000000000000000000000000002ed3b89b2e683ae310000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000002a87c0252000000000000000000000000007122db0ebe4eb9b434a9f2ffe6760bc03bfbd0e0000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000001800000000000000000000000006b175474e89094c44da98b954eedeac495271d0f000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee000000000000000000000000c3d03e4f041fd4cd388c549ee2a29a9e5075882f000000000000000000000000c65f7b26a7bba778efd39641c46599bbdbecccf7000000000000000000000000000000000000000000000002ed3b89b2e683ae3100000000000000000000000000000000000000000000000000655d6351642b0400000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000e30000000000000000000000000000000000000000000000a500008f00005300206ae4071198002dc6c0c3d03e4f041fd4cd388c549ee2a29a9e5075882f00000000000000000000000000000000000000000000000000655d6351642b046b175474e89094c44da98b954eedeac495271d0f4101c02aaa39b223fe8d0a0e5c4f27ead9083c756cc200042e1a7d4d0000000000000000000000000000000000000000000000000000000000000000c0611111111254fb6c44bac0bed2854e76f90643097d000000000000000000000000000000000000000000000002ed3b89b2e683ae310000000000000000000000000000000000000000000000000000000000cfee7c08000000000000000000000000000000000000000000000000",
          "type": 2,
          "maxFeePerGas": 49870576422,
          "maxPriorityFeePerGas": 170000000,
        },
      ],
      "gasUsed": [21000, 46458, 159995],
      "internalTransactions": [
        [],
        [],
        [
          {
            "type": "CALL",
            "from": "0xc65f7b26a7bba778efd39641c46599bbdbecccf7",
            "to": "0x6b175474e89094c44da98b954eedeac495271d0f",
            "input":
              "0x23b872dd0000000000000000000000005dbcc5267d8f7f9905d1c404d1160268dea0b5ea000000000000000000000000c65f7b26a7bba778efd39641c46599bbdbecccf7000000000000000000000000000000000000000000000002ed3b89b2e683ae31",
            "gas": 449899,
            "gasUsed": 32518,
            "value": "0",
            "contractCall": {
              "methodName": "transferFrom",
              "params": {
                "_from": "0x5dbcc5267d8f7f9905d1c404d1160268dea0b5ea",
                "_to": "0xc65f7b26a7bba778efd39641c46599bbdbecccf7",
                "_value": "53987896359498526257",
              },
              "contractAddress": "0x6b175474e89094c44da98b954eedeac495271d0f",
              "contractType": "erc20",
              "contractAlias": "DAI",
              "contractDecimals": 18,
              "contractName": "Dai Stablecoin",
              "decimalValue": "53.987896359498526257",
            },
          },
          {
            "type": "CALL",
            "from": "0xc65f7b26a7bba778efd39641c46599bbdbecccf7",
            "to": "0x1111111254fb6c44bac0bed2854e76f90643097d",
            "input":
              "0x7c0252000000000000000000000000007122db0ebe4eb9b434a9f2ffe6760bc03bfbd0e0000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000001800000000000000000000000006b175474e89094c44da98b954eedeac495271d0f000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee000000000000000000000000c3d03e4f041fd4cd388c549ee2a29a9e5075882f000000000000000000000000c65f7b26a7bba778efd39641c46599bbdbecccf7000000000000000000000000000000000000000000000002ed3b89b2e683ae3100000000000000000000000000000000000000000000000000655d6351642b0400000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000e30000000000000000000000000000000000000000000000a500008f00005300206ae4071198002dc6c0c3d03e4f041fd4cd388c549ee2a29a9e5075882f00000000000000000000000000000000000000000000000000655d6351642b046b175474e89094c44da98b954eedeac495271d0f4101c02aaa39b223fe8d0a0e5c4f27ead9083c756cc200042e1a7d4d0000000000000000000000000000000000000000000000000000000000000000c0611111111254fb6c44bac0bed2854e76f90643097d000000000000000000000000000000000000000000000002ed3b89b2e683ae310000000000000000000000000000000000000000000000000000000000cfee7c08",
            "gas": 410751,
            "gasUsed": 97986,
            "value": "0",
            "contractCall": {
              "methodName": "swap",
              "params": {
                "caller": "0x7122db0ebe4eb9b434a9f2ffe6760bc03bfbd0e0",
                "data":
                  "0x0000000000000000000000000000000000000000000000a500008f00005300206ae4071198002dc6c0c3d03e4f041fd4cd388c549ee2a29a9e5075882f00000000000000000000000000000000000000000000000000655d6351642b046b175474e89094c44da98b954eedeac495271d0f4101c02aaa39b223fe8d0a0e5c4f27ead9083c756cc200042e1a7d4d0000000000000000000000000000000000000000000000000000000000000000c0611111111254fb6c44bac0bed2854e76f90643097d000000000000000000000000000000000000000000000002ed3b89b2e683ae31",
                "desc": {
                  "amount": "53987896359498526257",
                  "dstReceiver": "0xc65f7b26a7bba778efd39641c46599bbdbecccf7",
                  "dstToken": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
                  "flags": "4",
                  "minReturnAmount": "28531653796440836",
                  "permit": "0x",
                  "srcReceiver": "0xc3d03e4f041fd4cd388c549ee2a29a9e5075882f",
                  "srcToken": "0x6b175474e89094c44da98b954eedeac495271d0f",
                },
              },
              "contractAddress": "0x1111111254fb6c44bac0bed2854e76f90643097d",
              "contractType": "AggregationRouterV4",
              "contractName": "1inch V4 Router",
            },
          },
          {
            "type": "CALL",
            "from": "0x1111111254fb6c44bac0bed2854e76f90643097d",
            "to": "0x6b175474e89094c44da98b954eedeac495271d0f",
            "input":
              "0x23b872dd000000000000000000000000c65f7b26a7bba778efd39641c46599bbdbecccf7000000000000000000000000c3d03e4f041fd4cd388c549ee2a29a9e5075882f000000000000000000000000000000000000000000000002ed3b89b2e683ae31",
            "gas": 401545,
            "gasUsed": 8618,
            "value": "0",
            "contractCall": {
              "methodName": "transferFrom",
              "params": {
                "_from": "0xc65f7b26a7bba778efd39641c46599bbdbecccf7",
                "_to": "0xc3d03e4f041fd4cd388c549ee2a29a9e5075882f",
                "_value": "53987896359498526257",
              },
              "contractAddress": "0x6b175474e89094c44da98b954eedeac495271d0f",
              "contractType": "erc20",
              "contractAlias": "DAI",
              "contractDecimals": 18,
              "contractName": "Dai Stablecoin",
              "decimalValue": "53.987896359498526257",
            },
          },
          {
            "type": "CALL",
            "from": "0x1111111254fb6c44bac0bed2854e76f90643097d",
            "to": "0x7122db0ebe4eb9b434a9f2ffe6760bc03bfbd0e0",
            "input":
              "0x2636f7f8000000000000000000000000c65f7b26a7bba778efd39641c46599bbdbecccf70000000000000000000000000000000000000000000000a500008f00005300206ae4071198002dc6c0c3d03e4f041fd4cd388c549ee2a29a9e5075882f00000000000000000000000000000000000000000000000000655d6351642b046b175474e89094c44da98b954eedeac495271d0f4101c02aaa39b223fe8d0a0e5c4f27ead9083c756cc200042e1a7d4d0000000000000000000000000000000000000000000000000000000000000000c0611111111254fb6c44bac0bed2854e76f90643097d000000000000000000000000000000000000000000000002ed3b89b2e683ae31",
            "gas": 388912,
            "gasUsed": 74236,
            "value": "0",
          },
          {
            "type": "CALL",
            "from": "0x7122db0ebe4eb9b434a9f2ffe6760bc03bfbd0e0",
            "to": "0x7122db0ebe4eb9b434a9f2ffe6760bc03bfbd0e0",
            "input":
              "0x6ae4071198002dc6c0c3d03e4f041fd4cd388c549ee2a29a9e5075882f00000000000000000000000000000000000000000000000000655d6351642b046b175474e89094c44da98b954eedeac495271d0f",
            "gas": 381841,
            "gasUsed": 55092,
            "value": "0",
          },
          {
            "type": "CALL",
            "from": "0x7122db0ebe4eb9b434a9f2ffe6760bc03bfbd0e0",
            "to": "0xc3d03e4f041fd4cd388c549ee2a29a9e5075882f",
            "input":
              "0x022c0d9f000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000666380c3fdbed90000000000000000000000007122db0ebe4eb9b434a9f2ffe6760bc03bfbd0e000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000000",
            "gas": 369163,
            "gasUsed": 48194,
            "value": "0",
          },
          {
            "type": "CALL",
            "from": "0xc3d03e4f041fd4cd388c549ee2a29a9e5075882f",
            "to": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            "input":
              "0xa9059cbb0000000000000000000000007122db0ebe4eb9b434a9f2ffe6760bc03bfbd0e000000000000000000000000000000000000000000000000000666380c3fdbed9",
            "gas": 350091,
            "gasUsed": 12862,
            "value": "0",
            "contractCall": {
              "methodName": "transfer",
              "params": {
                "_to": "0x7122db0ebe4eb9b434a9f2ffe6760bc03bfbd0e0",
                "_value": "28819852319637209",
              },
              "contractAddress": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
              "contractType": "erc20",
              "contractAlias": "WETH",
              "contractDecimals": 18,
              "contractName": "Wrapped Ether",
              "decimalValue": "0.028819852319637209",
            },
          },
          {
            "type": "CALL",
            "from": "0x7122db0ebe4eb9b434a9f2ffe6760bc03bfbd0e0",
            "to": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            "input": "0x2e1a7d4d00000000000000000000000000000000000000000000000000666380c3fdbed9",
            "gas": 326604,
            "gasUsed": 9240,
            "value": "0",
          },
          {
            "type": "CALL",
            "from": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            "to": "0x7122db0ebe4eb9b434a9f2ffe6760bc03bfbd0e0",
            "input": "0x",
            "gas": 2300,
            "gasUsed": 100,
            "value": "28819852319637209",
          },
          {
            "type": "CALL",
            "from": "0x7122db0ebe4eb9b434a9f2ffe6760bc03bfbd0e0",
            "to": "0x1111111254fb6c44bac0bed2854e76f90643097d",
            "input": "0x",
            "gas": 310158,
            "gasUsed": 79,
            "value": "28819852319637209",
          },
          {
            "type": "CALL",
            "from": "0x1111111254fb6c44bac0bed2854e76f90643097d",
            "to": "0xc65f7b26a7bba778efd39641c46599bbdbecccf7",
            "input": "0x",
            "gas": 2300,
            "gasUsed": 55,
            "value": "28819852319637209",
          },
          {
            "type": "CALL",
            "from": "0xc65f7b26a7bba778efd39641c46599bbdbecccf7",
            "to": "0x5dbcc5267d8f7f9905d1c404d1160268dea0b5ea",
            "input": "0x",
            "gas": 304764,
            "gasUsed": 0,
            "value": "28819852319637209",
          },
        ],
      ],
      "netBalanceChanges": [
        [],
        [],
        [
          {
            "address": "0x5dbcc5267d8f7f9905d1c404d1160268dea0b5ea",
            "balanceChanges": [
              {
                "delta": "-53987896359498526257",
                "asset": {
                  "type": "erc20",
                  "symbol": "DAI",
                  "contractAddress": "0x6b175474e89094c44da98b954eedeac495271d0f",
                },
                "breakdown": [
                  {
                    "counterparty": "0xc65f7b26a7bba778efd39641c46599bbdbecccf7",
                    "amount": "-53987896359498526257",
                  },
                ],
              },
              {
                "delta": "28819852319637209",
                "asset": {
                  "type": "ether",
                  "symbol": "ETH",
                },
                "breakdown": [
                  {
                    "counterparty": "0xc65f7b26a7bba778efd39641c46599bbdbecccf7",
                    "amount": "28819852319637209",
                  },
                ],
              },
            ],
          },
          {
            "address": "0xc3d03e4f041fd4cd388c549ee2a29a9e5075882f",
            "balanceChanges": [
              {
                "delta": "53987896359498526257",
                "asset": {
                  "type": "erc20",
                  "symbol": "DAI",
                  "contractAddress": "0x6b175474e89094c44da98b954eedeac495271d0f",
                },
                "breakdown": [
                  {
                    "counterparty": "0xc65f7b26a7bba778efd39641c46599bbdbecccf7",
                    "amount": "53987896359498526257",
                  },
                ],
              },
              {
                "delta": "-28819852319637209",
                "asset": {
                  "type": "erc20",
                  "symbol": "WETH",
                  "contractAddress": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
                },
                "breakdown": [
                  {
                    "counterparty": "0x7122db0ebe4eb9b434a9f2ffe6760bc03bfbd0e0",
                    "amount": "-28819852319637209",
                  },
                ],
              },
            ],
          },
          {
            "address": "0x7122db0ebe4eb9b434a9f2ffe6760bc03bfbd0e0",
            "balanceChanges": [
              {
                "delta": "28819852319637209",
                "asset": {
                  "type": "erc20",
                  "symbol": "WETH",
                  "contractAddress": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
                },
                "breakdown": [
                  {
                    "counterparty": "0xc3d03e4f041fd4cd388c549ee2a29a9e5075882f",
                    "amount": "28819852319637209",
                  },
                ],
              },
            ],
          },
          {
            "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            "balanceChanges": [
              {
                "delta": "-28819852319637209",
                "asset": {
                  "type": "ether",
                  "symbol": "ETH",
                },
                "breakdown": [
                  {
                    "counterparty": "0x7122db0ebe4eb9b434a9f2ffe6760bc03bfbd0e0",
                    "amount": "-28819852319637209",
                  },
                ],
              },
            ],
          },
        ],
      ],
      "error": [],
      "simDetails": {
        "blockNumber": 17030647,
        "blockContext": {
          "number": 17030647,
          "stateRoot": "0x46498ffed96326d0809c5dba21453e86b699a899691ab46f37d3b552ee3a1ad3",
          "baseFee": 21867370490,
          "time": 1681286976,
          "coinbase": "0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5",
          "gasLimit": 30000000,
          "random": "0x0000000000000000000000000000000000000000000000000000000000000000",
        },
        "performanceProfile": {
          "breakdown": [
            {
              "label": "detected",
              "timeStamp": "2023-04-12T08:09:40.643Z",
            },
            {
              "label": "traceStart",
              "timeStamp": "2023-04-12T08:09:40.654Z",
            },
            {
              "label": "traceEnd",
              "timeStamp": "2023-04-12T08:09:40.689Z",
            },
            {
              "label": "dispatch",
              "timeStamp": "2023-04-12T08:09:40.689Z",
            },
          ],
        },
        "e2eMs": 46,
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
        {
          "status": "fulfilled",
          "value": null,
        },
      ],
    },
    simulatorResponse: {},
  },
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

const failingResponse = {
  "status": "simulated",
  "simulatedBlockNumber": 17030828,
  "transactions": [
    {
      "from": "0x0000000000000000000000000000000000000000",
      "to": "0xDF40aEBa2e9907E900089bCcf929ffcCD8fA4e0b",
      "value": 1000000000000000000,
      "gas": 21000,
      "input": "0x",
      "type": 2,
      "maxFeePerGas": 22601726542,
      "maxPriorityFeePerGas": 310000000,
    },
    {
      "from": "0xDF40aEBa2e9907E900089bCcf929ffcCD8fA4e0b",
      "to": "0xC65F7B26a7bBa778efD39641C46599bBDBEcCCf7",
      "value": 0,
      "gas": 283654,
      "input":
        "0x9ca519c6000000000000000000000000dac17f958d2ee523a2206206994597c13d831ec7000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb4800000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000018768373e0444500000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111111254fb6c44bac0bed2854e76f90643097d0000000000000000000000000000000000000000000000000000000001c6caf60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000002687c0252000000000000000000000000007122db0ebe4eb9b434a9f2ffe6760bc03bfbd0e000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000180000000000000000000000000dac17f958d2ee523a2206206994597c13d831ec7000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb480000000000000000000000003041cbd36888becc7bbcbc0045e3b1f144466f5f000000000000000000000000c65f7b26a7bba778efd39641c46599bbdbecccf70000000000000000000000000000000000000000000000000000000001c6caf60000000000000000000000000000000000000000000000000000000001c0e2fd00000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a500000000000000000000000000000000000000000000000000000000006700206ae4071138002dc6c03041cbd36888becc7bbcbc0045e3b1f144466f5f1111111254fb6c44bac0bed2854e76f90643097d0000000000000000000000000000000000000000000000000000000001c0e2fddac17f958d2ee523a2206206994597c13d831ec70000000000000000000000000000000000000000000000000000000001c6caf6000000000000000000000000000000000000000000000000000000cfee7c08000000000000000000000000000000000000000000000000",
      "type": 2,
      "maxFeePerGas": 45203453084,
      "maxPriorityFeePerGas": 310000000,
    },
  ],
  "gasUsed": [21000, 283577],
  "internalTransactions": [
    [],
    [
      {
        "type": "CALL",
        "from": "0xc65f7b26a7bba778efd39641c46599bbdbecccf7",
        "to": "0xdac17f958d2ee523a2206206994597c13d831ec7",
        "input":
          "0x23b872dd000000000000000000000000df40aeba2e9907e900089bccf929ffccd8fa4e0b000000000000000000000000c65f7b26a7bba778efd39641c46599bbdbecccf70000000000000000000000000000000000000000000000000000000001c6caf6",
        "gas": 237741,
        "gasUsed": 43630,
        "value": "0",
        "contractCall": {
          "methodName": "transferFrom",
          "params": {
            "_from": "0xdf40aeba2e9907e900089bccf929ffccd8fa4e0b",
            "_to": "0xc65f7b26a7bba778efd39641c46599bbdbecccf7",
            "_value": "29805302",
          },
          "contractAddress": "0xdac17f958d2ee523a2206206994597c13d831ec7",
          "contractType": "erc20",
          "contractAlias": "USDT",
          "contractDecimals": 6,
          "contractName": "Tether USD",
          "decimalValue": "29.805302",
        },
      },
      {
        "type": "DELEGATECALL",
        "from": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        "to": "0xa2327a938febf5fec13bacfb16ae10ecbc4cbdcf",
        "input": "0x70a08231000000000000000000000000c65f7b26a7bba778efd39641c46599bbdbecccf7",
        "gas": 177802,
        "gasUsed": 2529,
        "value": "0",
        "contractCall": {
          "methodName": "balanceOf",
          "params": {
            "": "0xc65f7b26a7bba778efd39641c46599bbdbecccf7",
          },
          "contractAddress": "0xa2327a938febf5fec13bacfb16ae10ecbc4cbdcf",
          "contractType": "erc20",
          "contractAlias": "USDC",
          "contractDecimals": 6,
          "contractName": "USD Coin",
        },
      },
      {
        "type": "CALL",
        "from": "0xc65f7b26a7bba778efd39641c46599bbdbecccf7",
        "to": "0x1111111254fb6c44bac0bed2854e76f90643097d",
        "input":
          "0x7c0252000000000000000000000000007122db0ebe4eb9b434a9f2ffe6760bc03bfbd0e000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000180000000000000000000000000dac17f958d2ee523a2206206994597c13d831ec7000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb480000000000000000000000003041cbd36888becc7bbcbc0045e3b1f144466f5f000000000000000000000000c65f7b26a7bba778efd39641c46599bbdbecccf70000000000000000000000000000000000000000000000000000000001c6caf60000000000000000000000000000000000000000000000000000000001c0e2fd00000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a500000000000000000000000000000000000000000000000000000000006700206ae4071138002dc6c03041cbd36888becc7bbcbc0045e3b1f144466f5f1111111254fb6c44bac0bed2854e76f90643097d0000000000000000000000000000000000000000000000000000000001c0e2fddac17f958d2ee523a2206206994597c13d831ec70000000000000000000000000000000000000000000000000000000001c6caf6000000000000000000000000000000000000000000000000000000cfee7c08",
        "gas": 174866,
        "gasUsed": 129469,
        "value": "0",
        "contractCall": {
          "methodName": "swap",
          "params": {
            "caller": "0x7122db0ebe4eb9b434a9f2ffe6760bc03bfbd0e0",
            "data":
              "0x00000000000000000000000000000000000000000000000000000000006700206ae4071138002dc6c03041cbd36888becc7bbcbc0045e3b1f144466f5f1111111254fb6c44bac0bed2854e76f90643097d0000000000000000000000000000000000000000000000000000000001c0e2fddac17f958d2ee523a2206206994597c13d831ec70000000000000000000000000000000000000000000000000000000001c6caf6",
            "desc": {
              "amount": "29805302",
              "dstReceiver": "0xc65f7b26a7bba778efd39641c46599bbdbecccf7",
              "dstToken": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
              "flags": "4",
              "minReturnAmount": "29418237",
              "permit": "0x",
              "srcReceiver": "0x3041cbd36888becc7bbcbc0045e3b1f144466f5f",
              "srcToken": "0xdac17f958d2ee523a2206206994597c13d831ec7",
            },
          },
          "contractAddress": "0x1111111254fb6c44bac0bed2854e76f90643097d",
          "contractType": "AggregationRouterV4",
          "contractName": "1inch V4 Router",
        },
      },
      {
        "type": "CALL",
        "from": "0x1111111254fb6c44bac0bed2854e76f90643097d",
        "to": "0xdac17f958d2ee523a2206206994597c13d831ec7",
        "input":
          "0x23b872dd000000000000000000000000c65f7b26a7bba778efd39641c46599bbdbecccf70000000000000000000000003041cbd36888becc7bbcbc0045e3b1f144466f5f0000000000000000000000000000000000000000000000000000000001c6caf6",
        "gas": 169345,
        "gasUsed": 11730,
        "value": "0",
        "contractCall": {
          "methodName": "transferFrom",
          "params": {
            "_from": "0xc65f7b26a7bba778efd39641c46599bbdbecccf7",
            "_to": "0x3041cbd36888becc7bbcbc0045e3b1f144466f5f",
            "_value": "29805302",
          },
          "contractAddress": "0xdac17f958d2ee523a2206206994597c13d831ec7",
          "contractType": "erc20",
          "contractAlias": "USDT",
          "contractDecimals": 6,
          "contractName": "Tether USD",
          "decimalValue": "29.805302",
        },
      },
      {
        "type": "CALL",
        "from": "0x1111111254fb6c44bac0bed2854e76f90643097d",
        "to": "0x7122db0ebe4eb9b434a9f2ffe6760bc03bfbd0e0",
        "input":
          "0x2636f7f8000000000000000000000000c65f7b26a7bba778efd39641c46599bbdbecccf700000000000000000000000000000000000000000000000000000000006700206ae4071138002dc6c03041cbd36888becc7bbcbc0045e3b1f144466f5f1111111254fb6c44bac0bed2854e76f90643097d0000000000000000000000000000000000000000000000000000000001c0e2fddac17f958d2ee523a2206206994597c13d831ec70000000000000000000000000000000000000000000000000000000001c6caf6",
        "gas": 154024,
        "gasUsed": 79938,
        "value": "0",
      },
      {
        "type": "CALL",
        "from": "0x7122db0ebe4eb9b434a9f2ffe6760bc03bfbd0e0",
        "to": "0x7122db0ebe4eb9b434a9f2ffe6760bc03bfbd0e0",
        "input":
          "0x6ae4071138002dc6c03041cbd36888becc7bbcbc0045e3b1f144466f5f1111111254fb6c44bac0bed2854e76f90643097d0000000000000000000000000000000000000000000000000000000001c0e2fddac17f958d2ee523a2206206994597c13d831ec7",
        "gas": 150620,
        "gasUsed": 78523,
        "value": "0",
      },
      {
        "type": "CALL",
        "from": "0x7122db0ebe4eb9b434a9f2ffe6760bc03bfbd0e0",
        "to": "0x3041cbd36888becc7bbcbc0045e3b1f144466f5f",
        "input":
          "0x022c0d9f0000000000000000000000000000000000000000000000000000000001c56bbf00000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111111254fb6c44bac0bed2854e76f90643097d00000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000000",
        "gas": 141122,
        "gasUsed": 71186,
        "value": "0",
      },
      {
        "type": "CALL",
        "from": "0x3041cbd36888becc7bbcbc0045e3b1f144466f5f",
        "to": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        "input":
          "0xa9059cbb0000000000000000000000001111111254fb6c44bac0bed2854e76f90643097d0000000000000000000000000000000000000000000000000000000001c56bbf",
        "gas": 128212,
        "gasUsed": 37517,
        "value": "0",
        "contractCall": {
          "methodName": "transfer",
          "params": {
            "_to": "0x1111111254fb6c44bac0bed2854e76f90643097d",
            "_value": "29715391",
          },
          "contractAddress": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
          "contractType": "erc20",
          "contractAlias": "USDC",
          "contractDecimals": 6,
          "contractName": "USD Coin",
          "decimalValue": "29.715391",
        },
      },
      {
        "type": "DELEGATECALL",
        "from": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        "to": "0xa2327a938febf5fec13bacfb16ae10ecbc4cbdcf",
        "input":
          "0xa9059cbb0000000000000000000000001111111254fb6c44bac0bed2854e76f90643097d0000000000000000000000000000000000000000000000000000000001c56bbf",
        "gas": 125476,
        "gasUsed": 36728,
        "value": "0",
        "contractCall": {
          "methodName": "transfer",
          "params": {
            "_to": "0x1111111254fb6c44bac0bed2854e76f90643097d",
            "_value": "29715391",
          },
          "contractAddress": "0xa2327a938febf5fec13bacfb16ae10ecbc4cbdcf",
          "contractType": "erc20",
          "contractAlias": "USDC",
          "contractDecimals": 6,
          "contractName": "USD Coin",
          "decimalValue": "29.715391",
        },
      },
      {
        "type": "DELEGATECALL",
        "from": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        "to": "0xa2327a938febf5fec13bacfb16ae10ecbc4cbdcf",
        "input": "0x70a082310000000000000000000000003041cbd36888becc7bbcbc0045e3b1f144466f5f",
        "gas": 88514,
        "gasUsed": 529,
        "value": "0",
        "contractCall": {
          "methodName": "balanceOf",
          "params": {
            "": "0x3041cbd36888becc7bbcbc0045e3b1f144466f5f",
          },
          "contractAddress": "0xa2327a938febf5fec13bacfb16ae10ecbc4cbdcf",
          "contractType": "erc20",
          "contractAlias": "USDC",
          "contractDecimals": 6,
          "contractName": "USD Coin",
        },
      },
      {
        "type": "DELEGATECALL",
        "from": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        "to": "0xa2327a938febf5fec13bacfb16ae10ecbc4cbdcf",
        "input": "0x70a082310000000000000000000000001111111254fb6c44bac0bed2854e76f90643097d",
        "gas": 72856,
        "gasUsed": 529,
        "value": "0",
        "contractCall": {
          "methodName": "balanceOf",
          "params": {
            "": "0x1111111254fb6c44bac0bed2854e76f90643097d",
          },
          "contractAddress": "0xa2327a938febf5fec13bacfb16ae10ecbc4cbdcf",
          "contractType": "erc20",
          "contractAlias": "USDC",
          "contractDecimals": 6,
          "contractName": "USD Coin",
        },
      },
      {
        "type": "CALL",
        "from": "0x1111111254fb6c44bac0bed2854e76f90643097d",
        "to": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        "input":
          "0xa9059cbb000000000000000000000000c65f7b26a7bba778efd39641c46599bbdbecccf70000000000000000000000000000000000000000000000000000000001c56bbf",
        "gas": 71632,
        "gasUsed": 26717,
        "value": "0",
        "contractCall": {
          "methodName": "transfer",
          "params": {
            "_to": "0xc65f7b26a7bba778efd39641c46599bbdbecccf7",
            "_value": "29715391",
          },
          "contractAddress": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
          "contractType": "erc20",
          "contractAlias": "USDC",
          "contractDecimals": 6,
          "contractName": "USD Coin",
          "decimalValue": "29.715391",
        },
      },
      {
        "type": "DELEGATECALL",
        "from": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        "to": "0xa2327a938febf5fec13bacfb16ae10ecbc4cbdcf",
        "input":
          "0xa9059cbb000000000000000000000000c65f7b26a7bba778efd39641c46599bbdbecccf70000000000000000000000000000000000000000000000000000000001c56bbf",
        "gas": 69780,
        "gasUsed": 25928,
        "value": "0",
        "contractCall": {
          "methodName": "transfer",
          "params": {
            "_to": "0xc65f7b26a7bba778efd39641c46599bbdbecccf7",
            "_value": "29715391",
          },
          "contractAddress": "0xa2327a938febf5fec13bacfb16ae10ecbc4cbdcf",
          "contractType": "erc20",
          "contractAlias": "USDC",
          "contractDecimals": 6,
          "contractName": "USD Coin",
          "decimalValue": "29.715391",
        },
      },
      {
        "type": "DELEGATECALL",
        "from": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        "to": "0xa2327a938febf5fec13bacfb16ae10ecbc4cbdcf",
        "input": "0x70a08231000000000000000000000000c65f7b26a7bba778efd39641c46599bbdbecccf7",
        "gas": 45544,
        "gasUsed": 529,
        "value": "0",
        "contractCall": {
          "methodName": "balanceOf",
          "params": {
            "": "0xc65f7b26a7bba778efd39641c46599bbdbecccf7",
          },
          "contractAddress": "0xa2327a938febf5fec13bacfb16ae10ecbc4cbdcf",
          "contractType": "erc20",
          "contractAlias": "USDC",
          "contractDecimals": 6,
          "contractName": "USD Coin",
        },
      },
      {
        "type": "DELEGATECALL",
        "from": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        "to": "0xa2327a938febf5fec13bacfb16ae10ecbc4cbdcf",
        "input": "0x313ce567",
        "gas": 21638,
        "gasUsed": 2381,
        "value": "0",
        "contractCall": {
          "methodName": "decimals",
          "params": {},
          "contractAddress": "0xa2327a938febf5fec13bacfb16ae10ecbc4cbdcf",
          "contractType": "erc20",
          "contractAlias": "USDC",
          "contractDecimals": 6,
          "contractName": "USD Coin",
        },
      },
      {
        "type": "DELEGATECALL",
        "from": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        "to": "0xa2327a938febf5fec13bacfb16ae10ecbc4cbdcf",
        "input":
          "0xdd62ed3e000000000000000000000000c65f7b26a7bba778efd39641c46599bbdbecccf70000000000000000000000007a250d5630b4cf539739df2c5dacb4c659f2488d",
        "gas": 13351,
        "gasUsed": 2637,
        "value": "0",
        "contractCall": {
          "methodName": "allowance",
          "params": {
            "": "0x7a250d5630b4cf539739df2c5dacb4c659f2488d",
          },
          "contractAddress": "0xa2327a938febf5fec13bacfb16ae10ecbc4cbdcf",
          "contractType": "erc20",
          "contractAlias": "USDC",
          "contractDecimals": 6,
          "contractName": "USD Coin",
        },
      },
      {
        "type": "CALL",
        "from": "0xc65f7b26a7bba778efd39641c46599bbdbecccf7",
        "to": "0x7a250d5630b4cf539739df2c5dacb4c659f2488d",
        "input":
          "0x4a25d94a0000000000000000000000000000000000000000000000000018768373e044450000000000000000000000000000000000000000000000000000000001c56bbf00000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000c65f7b26a7bba778efd39641c46599bbdbecccf70000000000000000000000000000000000000000000000000000000064366fc80000000000000000000000000000000000000000000000000000000000000002000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
        "error": "execution reverted",
        "gas": 7254,
        "gasUsed": 7254,
        "value": "0",
        "contractCall": {
          "methodName": "swapTokensForExactETH",
          "params": {
            "amountInMax": "29715391",
            "amountOut": "6885706397926469",
            "deadline": "1681289160",
            "path": ["0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"],
            "to": "0xc65f7b26a7bba778efd39641c46599bbdbecccf7",
          },
          "contractAddress": "0x7a250d5630b4cf539739df2c5dacb4c659f2488d",
          "contractType": "Uniswap V2: Router 2",
        },
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
            "delta": "-29805302",
            "asset": {
              "type": "erc20",
              "symbol": "USDT",
              "contractAddress": "0xdac17f958d2ee523a2206206994597c13d831ec7",
            },
            "breakdown": [
              {
                "counterparty": "0xc65f7b26a7bba778efd39641c46599bbdbecccf7",
                "amount": "-29805302",
              },
            ],
          },
        ],
      },
      {
        "address": "0xc65f7b26a7bba778efd39641c46599bbdbecccf7",
        "balanceChanges": [
          {
            "delta": "29715391",
            "asset": {
              "type": "erc20",
              "symbol": "USDC",
              "contractAddress": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            },
            "breakdown": [
              {
                "counterparty": "0x1111111254fb6c44bac0bed2854e76f90643097d",
                "amount": "29715391",
              },
            ],
          },
        ],
      },
      {
        "address": "0x3041cbd36888becc7bbcbc0045e3b1f144466f5f",
        "balanceChanges": [
          {
            "delta": "29805302",
            "asset": {
              "type": "erc20",
              "symbol": "USDT",
              "contractAddress": "0xdac17f958d2ee523a2206206994597c13d831ec7",
            },
            "breakdown": [
              {
                "counterparty": "0xc65f7b26a7bba778efd39641c46599bbdbecccf7",
                "amount": "29805302",
              },
            ],
          },
          {
            "delta": "-29715391",
            "asset": {
              "type": "erc20",
              "symbol": "USDC",
              "contractAddress": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            },
            "breakdown": [
              {
                "counterparty": "0x1111111254fb6c44bac0bed2854e76f90643097d",
                "amount": "-29715391",
              },
            ],
          },
        ],
      },
    ],
  ],
  "error": ["execution reverted"],
  "simDetails": {
    "blockNumber": 17030828,
    "blockContext": {
      "number": 17030828,
      "stateRoot": "0x85a0fd1dbaeb2fdc7dda517eeba10f9a5242a7fc3783fc3fa884ebf0e5c4cc50",
      "baseFee": 19953613674,
      "time": 1681289160,
      "coinbase": "0x8242c66a8a39259333d2326eb37770d79c38f6f2",
      "gasLimit": 30000000,
      "random": "0x0000000000000000000000000000000000000000000000000000000000000000",
    },
    "performanceProfile": {
      "breakdown": [
        {
          "label": "detected",
          "timeStamp": "2023-04-12T08:46:02.038Z",
        },
        {
          "label": "traceStart",
          "timeStamp": "2023-04-12T08:46:02.041Z",
        },
        {
          "label": "traceEnd",
          "timeStamp": "2023-04-12T08:46:02.106Z",
        },
        {
          "label": "dispatch",
          "timeStamp": "2023-04-12T08:46:02.106Z",
        },
      ],
    },
    "e2eMs": 68,
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
};
