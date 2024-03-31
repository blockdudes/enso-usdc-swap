import axios from "axios";
import utils from "./utils.js";

const apiToken = "1e02632d-6feb-4a75-a157-documentation"
const swapUSDCToAlUSD = async () => {
  
  // this is the address we want to run the transaction from
  const fromAddress = "0xd292b72e5c787f9f7e092ab7802addf76930981f";
  // usdc address
  const tokenIn = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
  // swap amount = 1000 * 1e6 usdc
  const amountIn = "1000000000";
  // alUSD Address
  const tokenOut = "0xbc6da0fe9ad5f3b0d58160288917aa56653660e9";

  // note: the spender must hold & approve the required amount for the smart wallet
  const spender = fromAddress;
  // this is the chain id we want to make the transaction on
  const chainId = 1;
  // we can set the receiver so it will be transferred out of the smart wallet
  const receiver = fromAddress;

  const {
    data: { address: walletAddress },
  } = await axios.get(
    `https://api.enso.finance/api/v1/wallet?chainId=${chainId}&fromAddress=${fromAddress}`,
    {
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
    }
  );

  const signer = await utils.setup(chainId, fromAddress);
  const response = await axios.get(
    `https://api.enso.finance/api/v1/shortcuts/route?chainId=${chainId}&fromAddress=${fromAddress}&slippage=300&tokenIn=${tokenIn}&tokenOut=${tokenOut}&amountIn=${amountIn}&spender=${spender}&receiver=${receiver}`,
    {
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
    }
  );

  const balanceBefore = await utils.getTokenBalance(tokenOut, fromAddress);
  await utils.approveToken(tokenIn, walletAddress, amountIn);
  await signer.sendTransaction(response.data.tx);
  const balanceAfter = await utils.getTokenBalance(tokenOut, fromAddress);

  console.log(
    `alUSD balance for ${fromAddress} increased by ${
      balanceAfter - balanceBefore
    }`
  );
};

swapUSDCToAlUSD()
  .catch((e) => console.error("🚨", e))
  .finally(() => utils.teardown());
