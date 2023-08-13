import { Alchemy, Network } from 'alchemy-sdk';
import { useEffect, useState } from 'react';

import './App.css';

// Refer to the README doc for more information about using API
// keys in client-side code. You should never do this in production
// level code.
const settings = {
  apiKey: process.env.REACT_APP_ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};


// In this week's lessons we used ethers.js. Here we are using the
// Alchemy SDK is an umbrella library with several different packages.
//
// You can read more about the packages here:
//   https://docs.alchemy.com/reference/alchemy-sdk-api-surface-overview#api-surface
const alchemy = new Alchemy(settings);

function App() {
  const [blockDataList, setBlockDataList] = useState([]);

  useEffect(() => {
    async function getLast10Blocks() {
      const latestBlockNumber = await alchemy.core.getBlockNumber();
      const blockNumbers = Array.from({ length: 10 }, (_, index) => latestBlockNumber - index);

      const blocks = await Promise.all(
        blockNumbers.map(async (blockNumber) => {
          const block = await alchemy.core.getBlockWithTransactions(blockNumber);
          return { ...block, showTransactions: false }; // Add showTransactions property
        })
      );

      setBlockDataList(blocks);
    }

    getLast10Blocks();
  }, []);

  const toggleBlockTransactions = (blockNumber) => {
    setBlockDataList((prevBlocks) =>
      prevBlocks.map((block) =>
        block.number === blockNumber
          ? { ...block, showTransactions: !block.showTransactions }
          : block
      )
    );
  };

  const toggleTransactionDetails = (blockNumber, txIndex) => {
    setBlockDataList((prevBlocks) =>
      prevBlocks.map((block) =>
        block.number === blockNumber
          ? {
              ...block,
              transactions: block.transactions.map((tx, index) =>
                index === txIndex ? { ...tx, showDetails: !tx.showDetails } : tx
              ),
            }
          : block
      )
    );
  };

  return (
    <div className='App'>
      <h2>Last 10 Blocks</h2>
      <ul>
        {blockDataList.map((blockData) => (
          <li key={blockData.number}>
            <strong
              style={{ cursor: 'pointer' }}
              onClick={() => toggleBlockTransactions(blockData.number)}
            >
              Block Number: {blockData.number}
            </strong>
            {blockData.showTransactions && (
              <div>
                <strong>Timestamp:</strong> {new Date(blockData.timestamp * 1000).toLocaleString()}<br />
                <strong>Transactions:</strong>
                <ul>
                  {blockData.transactions.map((tx, txIndex) => (
                    <li key={txIndex}>
                      <strong
                        style={{ cursor: 'pointer' }}
                        onClick={() => toggleTransactionDetails(blockData.number, txIndex)}
                      >
                        Hash: {tx.hash}
                      </strong>
                      {tx.showDetails && (
                        <div>
                          <strong>From:</strong> {tx.from}<br />
                          <strong>To:</strong> {tx.to}<br />
                          <strong>Gas Used:</strong> {tx.gasUsed} <br />

                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}



export default App;