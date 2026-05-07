// src/components/ChatTab.tsx
export default function ChatTab({ chatBerichten, actieveSpeler, chatEindeRef, nieuwBericht, setNieuwBericht, verstuurChat }: any) {
  return (
    <div>
      <div className="chat-container">
        {chatBerichten.map((b: any) => (
          <div key={b.id} className={`chat-bericht ${b.speler_id === actieveSpeler.id ? 'chat-eigen' : ''}`}>
            <div style={{fontSize: '0.65rem', color: b.speler_id === actieveSpeler.id ? '#111827' : '#ADB5BD', marginBottom: 2}}>{b.spelers?.naam}</div>
            <div>{b.bericht}</div>
          </div>
        ))}
        <div ref={chatEindeRef} />
      </div>
      <form onSubmit={verstuurChat} style={{display:'flex', gap:10}}>
        <input className="full-input" style={{padding:'12px', marginBottom:0}} value={nieuwBericht} onChange={e => setNieuwBericht(e.target.value)} placeholder="Zeg iets..." />
        <button className="btn-primary" style={{width:'80px', padding:'12px'}} type="submit">➤</button>
      </form>
    </div>
  );
}