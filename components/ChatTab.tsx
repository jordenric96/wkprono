// src/components/ChatTab.tsx
import React, { useEffect } from 'react';

export default function ChatTab({ chatBerichten, actieveSpeler, chatEindeRef, nieuwBericht, setNieuwBericht, verstuurChat }: any) {
  
  // Zorg dat de chat altijd soepel naar het nieuwste bericht (onderaan) scrollt
  useEffect(() => {
    if (chatEindeRef.current) {
      chatEindeRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatBerichten, chatEindeRef]);

  // Haal een mooi klokje uit de database tijdstempel (bijv. "14:30")
  const formatTijd = (isoString: string) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '65vh', maxHeight: '550px' }}>
      
      <style>{`
        /* De grote chat box */
        .chat-wrapper {
          flex: 1;
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 15px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
          border: 2px solid rgba(255,255,255,0.8);
          box-shadow: inset 0 4px 10px rgba(0,0,0,0.05);
          margin-bottom: 12px;
          scrollbar-width: none; /* Verberg scrollbar in Firefox */
        }
        .chat-wrapper::-webkit-scrollbar { display: none; } /* Verberg scrollbar in Chrome/Safari */

        /* Structuur van een bericht */
        .chat-bericht-box {
          max-width: 85%;
          display: flex;
          flex-direction: column;
        }
        .chat-bericht-eigen {
          align-self: flex-end;
          align-items: flex-end;
        }
        .chat-bericht-ander {
          align-self: flex-start;
          align-items: flex-start;
        }

        /* Het tekstballonnetje */
        .chat-bubble {
          padding: 10px 14px;
          font-size: 0.9rem;
          font-weight: 700;
          line-height: 1.4;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
          word-break: break-word;
        }

        /* Jouw eigen berichten (Blauw/Aqua gradient met 'staartje' rechts) */
        .bubble-eigen {
          background: linear-gradient(135deg, var(--crayola), var(--aqua));
          color: white;
          border-radius: 18px 18px 4px 18px;
        }

        /* Berichten van anderen (Wit met 'staartje' links) */
        .bubble-ander {
          background: #FFF;
          color: #111827;
          border-radius: 18px 18px 18px 4px;
          border: 1px solid #E9ECEF;
        }

        /* Naam & Tijdstip labeltje */
        .chat-meta {
          font-size: 0.6rem;
          font-weight: 900;
          color: #ADB5BD;
          margin-bottom: 4px;
          display: flex;
          gap: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* Het strakke invoerveld onderaan */
        .chat-form {
          display: flex;
          gap: 8px;
          background: #FFF;
          padding: 6px;
          border-radius: 30px;
          border: 2px solid #E9ECEF;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        }
        .chat-input {
          flex: 1;
          border: none;
          background: transparent;
          padding: 10px 15px;
          font-size: 0.9rem;
          font-weight: 800;
          outline: none;
          color: #111827;
        }
        .chat-input::placeholder { color: #ADB5BD; font-weight: 700; }
        
        .chat-btn {
          background: var(--magenta);
          color: white;
          border: none;
          width: 45px;
          height: 45px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 10px rgba(240, 56, 255, 0.3);
          transition: transform 0.2s;
        }
        .chat-btn:active { transform: scale(0.9); }
      `}</style>

      {/* CHAT BERICHTEN AREA */}
      <div className="chat-wrapper">
        {chatBerichten.length === 0 ? (
          <div style={{ textAlign: 'center', margin: 'auto', color: '#ADB5BD', fontWeight: 800, fontSize: '0.9rem' }}>
            De kleedkamer is nog leeg... 🤫
          </div>
        ) : (
          chatBerichten.map((b: any) => {
            const isMij = b.speler_id === actieveSpeler.id;
            return (
              <div key={b.id} className={`chat-bericht-box ${isMij ? 'chat-bericht-eigen' : 'chat-bericht-ander'}`}>
                
                {/* Naam en Tijd label */}
                <div className="chat-meta">
                  {isMij ? (
                    <><span>{formatTijd(b.created_at)}</span><span>•</span><span style={{color: 'var(--crayola)'}}>Jij</span></>
                  ) : (
                    <><span style={{color: '#6C757D'}}>{b.spelers?.naam.split(' ')[0]}</span><span>•</span><span>{formatTijd(b.created_at)}</span></>
                  )}
                </div>

                {/* De daadwerkelijke bubbel */}
                <div className={`chat-bubble ${isMij ? 'bubble-eigen' : 'bubble-ander'}`}>
                  {b.bericht}
                </div>

              </div>
            );
          })
        )}
        
        {/* Onzichtbaar anker om naartoe te scrollen */}
        <div ref={chatEindeRef} />
      </div>

      {/* INPUT FORMULIER */}
      <form className="chat-form" onSubmit={verstuurChat}>
        <input 
          className="chat-input" 
          value={nieuwBericht} 
          onChange={e => setNieuwBericht(e.target.value)} 
          placeholder="Bericht..." 
          autoComplete="off"
        />
        <button className="chat-btn" type="submit" disabled={!nieuwBericht.trim()}>
          {/* Mooi papieren vliegtuig SVG icoontje */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginLeft: '-2px', marginTop: '2px'}}>
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </form>

    </div>
  );
}