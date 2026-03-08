export default function Home() {
  return (
    <div style={{
      fontFamily: "Arial",
      background: "#0b0f19",
      color: "white",
      minHeight: "100vh",
      padding: "40px"
    }}>

      <h1 style={{fontSize:"48px", marginBottom:"10px"}}>
        CrossLedger (CLX)
      </h1>

      <p style={{fontSize:"20px", opacity:0.8}}>
        Global Trade Infrastructure Token
      </p>

      <hr style={{margin:"40px 0", opacity:0.2}} />

      <h2>Token Presale</h2>

      <p><b>Stage 1:</b> $0.10 per token</p>
      <p><b>Minimum Purchase:</b> $300</p>

      <p><b>Presale Wallet:</b></p>

      <div style={{
        background:"#121826",
        padding:"15px",
        borderRadius:"8px",
        marginBottom:"30px"
      }}>
        0x264c542adc1447e3a75af2b8e2c758d73e562571
      </div>

      <hr style={{margin:"40px 0", opacity:0.2}} />

      <h2>How To Participate</h2>

      <ol>
        <li>Download Trust Wallet or MetaMask</li>
        <li>Send ETH or USDT to the presale wallet</li>
        <li>CLX tokens will be distributed automatically</li>
      </ol>

      <hr style={{margin:"40px 0", opacity:0.2}} />

      <h2>Roadmap</h2>

      <ul>
        <li>Phase 1 – Token Launch & Presale</li>
        <li>Phase 2 – Trade Validation Platform</li>
        <li>Phase 3 – Global Commodity Transaction Network</li>
      </ul>

      <hr style={{margin:"40px 0", opacity:0.2}} />

      <h2>Vision</h2>

      <p style={{maxWidth:"700px", lineHeight:"1.6"}}>
        CrossLedger aims to build the infrastructure layer for global
        commodity trade, enabling secure and transparent transaction
        verification across oil, sugar, metals and agricultural markets.
      </p>

    </div>
  );
}
