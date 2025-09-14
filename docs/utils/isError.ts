import { ethers } from "ethers";

// 将异步代码包装在函数中
async function checkError() {
  try {
    const provider = new ethers.JsonRpcProvider("");
    await provider.getBalance("0x");
  } catch (error: any) {
    if (ethers.isError(error, "UNSUPPORTED_OPERATION")) {
      // code...
      console.log(error);
    }
  }
}

// 调用函数
checkError();
