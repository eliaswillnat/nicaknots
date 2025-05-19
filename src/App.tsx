import './App.css';
import { useState, useEffect } from 'react';
import { RefreshCcw } from 'lucide-react';
import Strings from './components/BikiniParts/Strings';
import CupInside from './components/BikiniParts/CupInside';
import FlowerBG from './components/BikiniParts/FlowerBg';
import FlowerPetals from './components/BikiniParts/FlowerPetals';

// Convert hex color to HSL components
function hexToHSL(hex: string): { h: number; s: number; l: number } {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex[1] + hex[2], 16);
    g = parseInt(hex[3] + hex[4], 16);
    b = parseInt(hex[5] + hex[6], 16);
  }
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

// Convert HSL components back to hex color
function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }
  const rr = Math.round((r + m) * 255);
  const gg = Math.round((g + m) * 255);
  const bb = Math.round((b + m) * 255);
  return '#' + ((1 << 24) | (rr << 16) | (gg << 8) | bb).toString(16).slice(1);
}

// Compute a slightly darker, less saturated border color
function adjustColor(hex: string): string {
  const { h, s, l } = hexToHSL(hex);
  const newS = Math.max(0, s * 0.95);
  const newL = Math.max(0, l * 0.9);
  return hslToHex(h, newS, newL);
}

function App() {
  // ── editable colours for each part ──
  const [partColors, setPartColors] = useState({
    strings: '#1A1A1A',
    outline: '#819174',
    cups: '#EEE9ED',
    flower: '#F2ECD9',
  });

  const [selectedPart, setSelectedPart] = useState<keyof typeof partColors | null>(null);
  const [clickedColorId, setClickedColorId] = useState<string | null>(null);

  // Randomize all part colors from the palette
  function randomizeColors() {
    const getRandomHex = () => palette[Math.floor(Math.random() * palette.length)].hex;
    setPartColors({
      strings: getRandomHex(),
      outline: getRandomHex(),
      cups: getRandomHex(),
      flower: getRandomHex(),
    });
  }

  function handleColorClick(hex: string) {
    if (!selectedPart) return;
    setPartColors(prev => ({ ...prev, [selectedPart]: hex }));
  }

  const palette = [
    { id: '038', hex: '#EEE9ED' },
    { id: '031', hex: '#F2ECD9' },
    { id: '077', hex: '#E0C2A1' },
    { id: '034', hex: '#FFD456' },
    { id: '066', hex: '#E0BC72' },
    { id: '067', hex: '#D8AE5A' },
    { id: '028', hex: '#C8D6C3' },
    { id: '030', hex: '#859996' },
    { id: '071', hex: '#819174' },
    { id: '056', hex: '#8BBDAF' },
    { id: '026', hex: '#057147' },
    { id: '079', hex: '#0A9996' },
    { id: '050', hex: '#B8DBE6' },
    { id: '048', hex: '#2D94A2' },
    { id: '070', hex: '#5AAAD8' },
    { id: '063', hex: '#959AAF' },
    { id: '080', hex: '#0F86D5' },
    { id: '075', hex: '#065A7F' },
    { id: '024', hex: '#05448A' },
    { id: '052', hex: '#19324A' },
    { id: '064', hex: '#404253' },
    { id: '081', hex: '#424688' },
    { id: '055', hex: '#FABFBE' },
    { id: '062', hex: '#B2ACBA' },
    { id: '007', hex: '#D17F92' },
    { id: '069', hex: '#EDA3A0' },
    { id: '060', hex: '#DFBEAF' },
    { id: '045', hex: '#FB97BA' },
    { id: '073', hex: '#CE396C' },
    { id: '004', hex: '#D82D39' },
    { id: '041', hex: '#BD94A2' },
    { id: '057', hex: '#96523A' },
    { id: '029', hex: '#351D19' },
    { id: '076', hex: '#7E482E' },
    { id: '005', hex: '#F39D30' },
    { id: '037', hex: '#EF923C' },
    { id: '068', hex: '#ECB077' },
    { id: '078', hex: '#A14D47' },
    { id: '027', hex: '#CBC5BD' },
    { id: '074', hex: '#B79E9C' },
    { id: '039', hex: '#1A1A1A' },
  ];

  useEffect(() => {
    randomizeColors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen p-4 bg-white relative">
      {/* Logo and Menu */}
      <header className="flex justify-between items-center mb-6">
        {/* Menu icon on the left */}
        <div className="flex items-center pl-4">
          <div className="w-6 h-6 flex flex-col justify-between cursor-pointer">
            <span className="h-[2px] w-full bg-black block" />
            <span className="h-[2px] w-full bg-black block" />
            <span className="h-[2px] w-full bg-black block" />
          </div>
        </div>

        {/* Centered title */}
        <h1 className="text-sm uppercase font-boston font-semibold tracking-[0.5em]">
          NICAKNOTS
        </h1>

        {/* Refresh button on the right */}
        <div className="pr-4">
          <button
            onClick={randomizeColors}
            aria-label="Randomize colors"
            className="flex items-center justify-center w-[3rem] h-[3rem] rounded-full border-2 border-black bg-transparent hover:scale-105 transition-transform"
            style={{ color: 'black', padding: 0 }}
          >
            <RefreshCcw size={24} stroke="black" />
          </button>
        </div>
      </header>

      {/* Bikini Image with selectable parts */}
      <div className="relative flex justify-center mb-6" style={{ marginTop: '2rem' }}>
        <svg
          viewBox="0 0 1000 1000"
          width="100%"
          height="100%"
          className="cursor-pointer"
        >
          {/* Strings */}
          <Strings
            color={partColors.strings}
            isSelected={selectedPart === 'strings'}
            onClick={() => setSelectedPart('strings')}
          />
          {/* Cup fill */}
          <CupInside
            color={partColors.cups}
            isSelected={selectedPart === 'cups'}
            onClick={() => setSelectedPart('cups')}
            className={selectedPart === 'cups' ? 'bounce-once' : ''}
          />
          {/* Centre flower background */}
          <FlowerBG
            color={partColors.flower}
            isSelected={selectedPart === 'flower'}
            onClick={() => setSelectedPart('flower')}
            className={selectedPart === 'flower' ? 'bounce-once' : ''}
          />
          {/* Cup outline (flower petals) */}
          <FlowerPetals
            color={partColors.outline}
            isSelected={selectedPart === 'outline'}
            onClick={() => setSelectedPart('outline')}
            className={selectedPart === 'outline' ? 'bounce-once' : ''}
          />
        </svg>
      </div>


      {/* Available Colors */}
      <h2 className="text-lg font-semibold mb-4 px-4 sm:px-12">Colors</h2>
      <section>
        <div className="flex flex-wrap justify-center gap-x-[1rem] gap-y-[1.5rem] px-4 sm:px-12">
          {palette.map(({ id, hex }, idx) => (
            <div key={idx} className="flex flex-col items-center space-y-1">
              <button
                className={`aspect-square w-[4rem] rounded-full ${clickedColorId === id ? 'bounce-once' : ''}`}
                style={{
                  backgroundColor: hex,
                  border: `2px solid ${adjustColor(hex)}`
                }}
                data-color-id={id}
                onClick={() => {
                  handleColorClick(hex);
                  setClickedColorId(id);
                }}
                onAnimationEnd={() => setClickedColorId(null)}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default App;