## Aurox Browser Extension Wallet

Aurox Wallet is an innovative web3 browser extension that provides industry-leading security measures, a simple user experience, and full data analytics to help users safely store and use their crypto and NFTs.


💻 [Download Aurox Wallet](https://chrome.google.com/webstore/detail/aurox-wallet/kilnpioakcdndlodeeceffgjdpojajlo?hl=en&authuser=0)

📂 [Aurox Documentation](https://docs.getaurox.com/)

📹 [Aurox Wallet Video Tutorials](https://getaurox.com/wallet/tutorials)

🐂 [Visit Aurox's Website](https://getaurox.com) | 🐦 [Follow us on Twitter](https://twitter.com/getaurox) | 👾 [Join our Discord](https://aurox.app/discord)


## Help make Aurox Wallet even better!
There's multiple ways you can contribute to help us improve the Aurox Wallet. 

 - [Report a bug](https://github.com/GetAurox/Aurox-Wallet/issues/new?title=%5BBug%5D%20Enter%20title%20here)
 - [Request a feature](https://github.com/GetAurox/Aurox-Wallet/issues/new?title=%5BFeature%20Request%5D%20Enter%20title%20here)
 - [Contribute to the codebase.](https://github.com/GetAurox/Aurox-Wallet#contributing-code)


## Setup Locally

 - Install Node v19.7.0. Preferably using [NVM.](https://github.com/nvm-sh/nvm)
 - Double check to make sure NPM is installed by running the following command in terminal.
	 - `npm -v`
- Clone or download this repository.
- Copy  the **.env.example** file to **.env**
- Edit the new **.env** based on instructions below.
- Run the following commands in the project directory to install dependencies:
	- `npm i --force`
- After all dependencies are installed you can:
	- Run it locally:  `npm run watch`
	- Build for production: `npm run build`

## Installing
Once you have built the extension, it will output the extension files in the `./dist/` directory. To install it, go to your Chromium based browser's extension settings.
1. Enable developer mode.
2. Click the "load unpacked" button.
3. Select the `./dist/` folder when prompted to select folder.

## Editing .env file
The .env file contains API keys for variety of endpoints that are required to make the Aurox Wallet fully operation. 

You can acquire free or free trial version of API keys from the following services by visiting their respective websites:

* Blockchain explorer API keys, such as [Etherscan](https://etherscan.io), and [BSCScan](https://bscscan.com/) are necessary for certain security features like smart contract validation.
* [Sentry](https://sentry.io/) API key is necessary to help you find and detect errors.
* RPC Providers, such as [Alchemy](https://alchemy.com) and [Infura](https://www.infura.io/), are utilized when interacting with the blockchain. For example, estimating gas or submitting transactions.


The only API key that is not available publicly is the `GRAPHQL_LEECHER_X_API_KEY`. This API key is for the Aurox Backend API. Our backend serves as a layer above the blockchain to provide data and analytics to the wallet. This includes portfolio charts, token USD prices, auto token importing and a variety of other functions that improves the user experience of the Aurox Wallet.

Our company will provide our backend API key on a per-request basis. If you would like a personal API key, please contact support@getaurox.com.

To build the project without the `GRAPHQL_LEECHER_X_API_KEY`, simply set the value to 0:

    GRAPHQL_LEECHER_X_API_KEY=0

Although the project will still build and install, some of the functionalities will not be available without the API key.


## Contributing code
There are two ways you can contribute to the codebase:

 **Bugs, fixes, and other small items** 
1. Fork the repository.
2. Create a pull request.
3. Our team will review and merge.

 **Larger implementations such as fulfilling feature requests**
 
If you are looking to implement larger functionalities or fulfill feature requests made by other users, Aurox will soon open up bounties for certain features on Gitcoin.

Please read the following two files before writing any code or creating a pull requests.

 - [Code Style Guidelines](https://github.com/GetAurox/Aurox-Wallet/blob/master/Code%20Style%20Guidelines.pdf)
 - [Architecture](https://github.com/GetAurox/Aurox-Wallet/blob/master/Architecture%20(WIP).pdf)
