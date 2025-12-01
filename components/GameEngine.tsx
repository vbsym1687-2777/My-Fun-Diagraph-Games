import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameType, DigraphGroup, RhymeGroup } from '../types';
import { playSound, speak } from '../services/audio';
import { updateProgress } from '../services/storage';
import { ArrowLeft, Check, X, RotateCcw } from 'lucide-react';

interface GameEngineProps {
  gameType: GameType;
  groups: DigraphGroup[];
  rhymeGroups: RhymeGroup[];
  onExit: () => void;
}

// Helper to get random item
function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export const GameEngine = ({ gameType, groups, rhymeGroups, onExit }: GameEngineProps) => {
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');
  const [score, setScore] = useState(0);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [dragTargets, setDragTargets] = useState<any[]>([]); 
  const [selectedItems, setSelectedItems] = useState<string[]>([]); 

  // Initialize a question based on game type
  const generateQuestion = useCallback(() => {
    setFeedback('none');
    setSelectedItems([]);
    
    // Safety check
    if (groups.length === 0) return;

    const group: DigraphGroup = randomItem(groups);
    const word: string = randomItem(group.words);
    const image = group.images[word] || '📝';

    switch (gameType) {
      case GameType.FIND_DIGRAPH: {
        // Show full word, ask for digraph
        const others: DigraphGroup[] = shuffle<DigraphGroup>(groups.filter(g => g.id !== group.id)).slice(0, 2);
        const options = shuffle([group.digraph, ...others.map(g => g.digraph)]);
        setCurrentQuestion({ 
          type: 'quiz', 
          word: word, // Full word shown
          instruction: "Find the digraph in this word!",
          answer: group.digraph, 
          fullWord: word,
          image: image,
          options,
          digraph: group.digraph
        });
        break;
      }
      case GameType.FILL_MISSING: {
        // e..g., fi__h -> options: sh, ch, th
        const others: DigraphGroup[] = shuffle<DigraphGroup>(groups.filter(g => g.id !== group.id)).slice(0, 2);
        const options = shuffle([group.digraph, ...others.map(g => g.digraph)]);
        setCurrentQuestion({ 
          type: 'quiz', 
          word: word.replace(group.digraph, '___'), 
          answer: group.digraph, 
          fullWord: word,
          image: gameType === GameType.FILL_MISSING ? image : null,
          options,
          digraph: group.digraph
        });
        break;
      }
      case GameType.RHYMING: {
        // Use separate Rhyme Data Set
        // 1. Pick a random rhyme group
        if (rhymeGroups.length === 0) return;
        const rGroup: RhymeGroup = randomItem(rhymeGroups);
        
        // 2. Pick two words from this group (Word A and Answer B)
        const availableWords = shuffle(rGroup.words);
        if (availableWords.length < 2) {
             // Fallback if not enough words in group
             generateQuestion();
             return;
        }
        
        const qWord = availableWords[0];
        const aWord = availableWords[1];

        // 3. Generate wrong options from OTHER rhyme groups
        const otherGroups = rhymeGroups.filter(rg => rg.id !== rGroup.id);
        const wrongWords: string[] = [];
        
        if (otherGroups.length > 0) {
             const flattenedWrong = otherGroups.flatMap(rg => rg.words);
             wrongWords.push(...shuffle<string>(flattenedWrong).slice(0, 2));
        } else {
             // Fallback if no other groups
             wrongWords.push('banana', 'orange');
        }

        setCurrentQuestion({
            type: 'quiz',
            instruction: `What rhymes with ${qWord}?`,
            word: qWord, // Show the question word
            answer: aWord,
            options: shuffle([aWord, ...wrongWords]),
            digraph: 'mix'
        });
        speak(qWord);
        break;
      }
      case GameType.ODD_ONE_OUT: {
        // 3 words from correct digraph, 1 from wrong
        const correctWords = shuffle(group.words).slice(0, 3);
        const wrongGroup: DigraphGroup = randomItem(groups.filter(g => g.id !== group.id));
        const wrongWord = randomItem(wrongGroup.words);
        
        setCurrentQuestion({
            type: 'odd_one',
            items: shuffle([...correctWords.map(w => ({ word: w, isOdd: false, img: group.images[w] || '📄' })), { word: wrongWord, isOdd: true, img: wrongGroup.images[wrongWord] || '📄' }]),
            instruction: `Find the odd one out! (Not ${group.digraph})`,
            digraph: group.digraph
        });
        break;
      }
      case GameType.WORD_PUZZLE: 
      case GameType.BUILD_WORD: {
        // Scramble letters or Digraph + Rest
        const parts = gameType === GameType.WORD_PUZZLE 
            ? shuffle([group.digraph, word.replace(group.digraph, '')]) // Just split digraph/rest
            : shuffle(word.split('')); // Split all chars
        
        setCurrentQuestion({
            type: 'build',
            target: word,
            image,
            parts,
            digraph: group.digraph
        });
        break;
      }
      case GameType.SORTING: {
        // Pick 2 digraphs
        const g1 = groups[0];
        const g2 = groups[1] || groups[0];
        if (g1 === g2 && groups.length > 1) { generateQuestion(); return; } // Retry if same

        const items = shuffle([
            ...shuffle(g1.words).slice(0, 4).map(w => ({ word: w, group: g1.digraph })),
            ...shuffle(g2.words).slice(0, 4).map(w => ({ word: w, group: g2.digraph }))
        ]);
        
        setCurrentQuestion({
            type: 'sort',
            bins: [g1.digraph, g2.digraph],
            items,
            digraph: 'mix'
        });
        break;
      }
      case GameType.WHEEL: {
         // Initial state is just the wheel
         setCurrentQuestion({ type: 'wheel_spin' });
         break;
      }
    }
  }, [gameType, groups, rhymeGroups]);

  // Initial Load
  useEffect(() => {
    generateQuestion();
  }, [generateQuestion]);

  const handleAnswer = (answer: string) => {
    if (feedback !== 'none') return; // Prevent double taps

    const isCorrect = answer === currentQuestion.answer;
    
    if (isCorrect) {
      playSound('correct');
      setFeedback('correct');
      setScore(s => s + 10);
      updateProgress(currentQuestion.digraph, true);
      setTimeout(generateQuestion, 1500);
    } else {
      playSound('wrong');
      setFeedback('wrong');
      updateProgress(currentQuestion.digraph, false);
      speak("Try again!");
      setTimeout(() => setFeedback('none'), 1000);
    }
  };

  const handleBuildWord = (part: string) => {
    const newSelection = [...selectedItems, part];
    setSelectedItems(newSelection);
    playSound('pop');
    speak(part);

    // Check if complete
    const builtWord = newSelection.join('');
    // If the built word length matches target length, check correctness
    if (builtWord.length >= currentQuestion.target.length) {
        if (builtWord === currentQuestion.target) {
            playSound('correct');
            setFeedback('correct');
            setScore(s => s + 20);
            speak(currentQuestion.target);
            setTimeout(generateQuestion, 1500);
        } else {
            playSound('wrong');
            setFeedback('wrong');
            speak("Oops!");
            setTimeout(() => {
                setSelectedItems([]);
                setFeedback('none');
            }, 1000);
        }
    }
  };

  const handleSort = (itemIndex: number, binIndex: number) => {
     // Simple verify for sorting
     const item = currentQuestion.items[itemIndex];
     const bin = currentQuestion.bins[binIndex];
     
     if (item.group === bin) {
         playSound('correct');
         // Remove item from list
         const newItems = [...currentQuestion.items];
         newItems.splice(itemIndex, 1);
         setCurrentQuestion({ ...currentQuestion, items: newItems });
         
         if (newItems.length === 0) {
             setFeedback('correct');
             speak("All sorted!");
             setTimeout(generateQuestion, 1500);
         }
     } else {
         playSound('wrong');
         speak("Not there!");
     }
  };

  const spinWheel = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    playSound('pop');
    
    // 1. Determine Winner first
    const winningIndex = Math.floor(Math.random() * groups.length);
    const winningGroup = groups[winningIndex];

    // 2. Calculate rotation to land winning index at Top (0deg)
    // Slice i is at angle: i * segmentAngle
    // We want the final visual angle of slice i to be 0
    // Visual Angle = (InitialAngle + Rotation) % 360
    // (i * seg + Rot) % 360 = 0  => Rot = -i*seg
    
    const segmentAngle = 360 / groups.length;
    const sliceCenter = (winningIndex * segmentAngle) + (segmentAngle / 2);
    
    // Rotate back by sliceCenter so it ends up at 0
    const targetBase = -sliceCenter;
    
    // Add multiple spins (minimum 3 spins = 1080)
    const minSpin = 1080;
    const currentRot = wheelRotation;
    
    // Calculate next rotation that satisfies the target alignment
    // We want finalRot = targetBase + K*360
    // And finalRot > currentRot + minSpin
    
    const M = Math.ceil((currentRot + minSpin - targetBase) / 360);
    const finalRotation = targetBase + (M * 360);
    
    setWheelRotation(finalRotation);

    setTimeout(() => {
        setIsSpinning(false);
        speak(`You got ${winningGroup.digraph}!`);
        
        // Transition to a mini-game with this digraph
        setTimeout(() => {
             const word: string = randomItem(winningGroup.words);
             const others = shuffle(groups.filter(g => g.id !== winningGroup.id)).slice(0, 2);
             const options = shuffle([winningGroup.digraph, ...others.map(g => g.digraph)]);
             
             setCurrentQuestion({ 
                type: 'quiz', 
                word: word.replace(winningGroup.digraph, '___'), // Fill blank style
                answer: winningGroup.digraph, 
                fullWord: word,
                image: winningGroup.images[word],
                options,
                digraph: winningGroup.digraph,
                isWheelResult: true,
                instruction: `Fill in the missing digraph for ${winningGroup.digraph}!`
            });
        }, 1500);

    }, 3000);
  };

  if (!currentQuestion) return <div className="p-10 text-center animate-pulse">Loading Game...</div>;

  // --- RENDERERS ---

  const renderQuiz = () => (
    <div className="flex flex-col items-center gap-6 w-full max-w-md">
       {currentQuestion.image && <div className="text-8xl animate-pop mb-4">{currentQuestion.image}</div>}
       <div className="text-5xl font-bold text-slate-700 bg-white px-8 py-4 rounded-3xl shadow-md mb-6">
         {currentQuestion.word}
       </div>
       {currentQuestion.instruction && <div className="text-xl text-slate-500 mb-4">{currentQuestion.instruction}</div>}
       
       <div className="grid grid-cols-2 gap-4 w-full px-4">
         {currentQuestion.options.map((opt: string, idx: number) => (
            <button 
              key={idx}
              onClick={() => handleAnswer(opt)}
              className={`
                h-20 text-3xl font-bold rounded-2xl shadow-lg transform transition-all active:scale-95
                ${feedback === 'correct' && opt === currentQuestion.answer ? 'bg-green-500 text-white scale-105' : ''}
                ${feedback === 'wrong' && opt !== currentQuestion.answer ? 'bg-gray-200 text-gray-400' : 'bg-white text-blue-600 hover:bg-blue-50'}
              `}
            >
              {opt}
            </button>
         ))}
       </div>
    </div>
  );

  const renderBuild = () => (
    <div className="flex flex-col items-center gap-8 w-full">
        <div className="text-8xl animate-pop">{currentQuestion.image}</div>
        
        {/* Drop Zone */}
        <div className="flex gap-2 min-h-[80px] bg-slate-200/50 p-4 rounded-2xl w-full justify-center">
            {selectedItems.map((part, i) => (
                <div key={i} className="bg-blue-500 text-white text-3xl font-bold px-4 py-2 rounded-xl animate-pop">
                    {part}
                </div>
            ))}
            {selectedItems.length === 0 && <span className="text-slate-400 self-center">Tap letters below!</span>}
        </div>

        {/* Source Tiles */}
        <div className="flex flex-wrap gap-3 justify-center">
             {currentQuestion.parts.map((part: string, idx: number) => (
                 <button
                   key={idx}
                   onClick={() => handleBuildWord(part)}
                   className="bg-white border-b-4 border-blue-200 text-slate-700 text-4xl font-bold w-16 h-16 rounded-xl shadow active:scale-90 hover:bg-blue-50"
                 >
                   {part}
                 </button>
             ))}
             <button onClick={() => setSelectedItems([])} className="bg-red-100 text-red-500 p-3 rounded-xl ml-4">
                 <RotateCcw size={24} />
             </button>
        </div>
    </div>
  );

  const renderWheel = () => {
      // Create conic gradient for the background
      const gradient = `conic-gradient(${
          groups.map((g, i) => {
              const start = (i / groups.length) * 100;
              const end = ((i + 1) / groups.length) * 100;
              const color = i % 2 === 0 ? '#FEF08A' : '#BFDBFE'; // yellow-200 / blue-200
              return `${color} ${start}% ${end}%`;
          }).join(', ')
      })`;

      return (
      <div className="flex flex-col items-center justify-center h-full relative overflow-hidden w-full">
          {/* Pointer */}
          <div className="absolute top-[5%] z-20 text-red-500 text-6xl drop-shadow-lg filter">⬇️</div>
          
          <div 
             className={`relative w-80 h-80 rounded-full border-8 border-yellow-400 shadow-2xl ${isSpinning ? 'wheel-spin' : ''}`}
             style={{ 
                 transform: `rotate(${wheelRotation}deg)`,
                 background: gradient
             }}
          >
             {/* Text Overlay Layer (Rotates with wheel) */}
             {groups.map((g, i) => {
                 const angle = 360 / groups.length;
                 const rotation = i * angle + (angle / 2); // Center text in slice
                 return (
                    <div
                       key={g.id + 'txt'}
                       className="absolute w-full h-full top-0 left-0 flex justify-center pt-6"
                       style={{ transform: `rotate(${rotation}deg)` }}
                    >
                        <span className="text-4xl font-bold text-slate-800 block mt-2 drop-shadow-md bg-white/30 px-2 rounded-lg">{g.digraph}</span>
                    </div>
                 );
             })}
          </div>
          
          <button 
            onClick={spinWheel} 
            disabled={isSpinning}
            className="mt-12 bg-orange-500 text-white text-2xl font-bold py-4 px-12 rounded-full shadow-lg border-b-4 border-orange-700 active:translate-y-1 transition-all disabled:opacity-50"
          >
             {isSpinning ? 'Spinning...' : 'SPIN!'}
          </button>
      </div>
      );
  };

  const renderOddOne = () => (
      <div className="grid grid-cols-2 gap-4 w-full px-4">
          <div className="col-span-2 text-center text-xl text-slate-500 mb-2">{currentQuestion.instruction}</div>
          {currentQuestion.items.map((item: any, idx: number) => (
             <button
               key={idx}
               onClick={() => {
                   if (item.isOdd) {
                       playSound('correct');
                       setFeedback('correct');
                       setScore(s => s + 10);
                       speak("You found it!");
                       setTimeout(generateQuestion, 1500);
                   } else {
                       playSound('wrong');
                       speak(item.word);
                   }
               }}
               className={`
                  flex flex-col items-center justify-center bg-white p-4 rounded-2xl shadow-md min-h-[140px] border-4 border-transparent active:scale-95
                  ${feedback === 'correct' && item.isOdd ? 'border-green-500 bg-green-50' : ''}
               `}
             >
                 <span className="text-5xl mb-2">{item.img}</span>
                 <span className="text-lg font-bold text-slate-600">{item.word}</span>
             </button>
          ))}
      </div>
  );

  const renderSort = () => (
      <div className="flex flex-col h-full w-full">
          {/* Falling Items Area */}
          <div className="flex-1 flex items-center justify-center p-4">
              {currentQuestion.items.length > 0 ? (
                  <div className="bg-white px-6 py-8 rounded-2xl shadow-xl border-b-8 border-slate-200 text-center animate-pop cursor-grab active:cursor-grabbing">
                      <div className="text-6xl mb-2">{groups.find((g: DigraphGroup) => g.digraph === currentQuestion.items[0].group)?.images[currentQuestion.items[0].word] || '📦'}</div>
                      <div className="text-2xl font-bold">{currentQuestion.items[0].word}</div>
                      <div className="text-sm text-slate-400 mt-2">Tap a basket below!</div>
                  </div>
              ) : (
                  <div className="text-4xl animate-bounce">🎉 Done!</div>
              )}
          </div>
          
          {/* Baskets */}
          <div className="flex justify-around w-full pb-8 px-2">
              {currentQuestion.bins.map((bin: string, idx: number) => (
                  <button 
                    key={idx}
                    onClick={() => handleSort(0, idx)}
                    className="flex flex-col items-center justify-end w-32 h-32 bg-amber-100 border-4 border-amber-300 rounded-b-3xl rounded-t-lg shadow-inner active:bg-amber-200 transition-colors"
                  >
                      <span className="text-4xl font-bold text-amber-800 mb-4">{bin}</span>
                  </button>
              ))}
          </div>
      </div>
  );

  return (
    <div className="fixed inset-0 bg-sky-50 z-50 flex flex-col">
       {/* Header */}
       <div className="flex justify-between items-center p-4 bg-white shadow-sm z-10">
           <button onClick={onExit} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200">
               <ArrowLeft className="text-slate-600" />
           </button>
           <div className="text-xl font-bold text-orange-500 flex items-center gap-2">
               <span>⭐</span> {score}
           </div>
       </div>

       {/* Game Area */}
       <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden max-w-lg mx-auto w-full">
          
          {/* Feedback Overlay */}
          {feedback === 'correct' && (
              <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
                  <div className="bg-white/90 p-8 rounded-full shadow-2xl animate-pop text-green-500">
                      <Check size={80} strokeWidth={4} />
                  </div>
              </div>
          )}
           {feedback === 'wrong' && (
              <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
                  <div className="bg-white/90 p-8 rounded-full shadow-2xl animate-pop text-red-500">
                      <X size={80} strokeWidth={4} />
                  </div>
              </div>
          )}

          {currentQuestion.type === 'quiz' && renderQuiz()}
          {currentQuestion.type === 'build' && renderBuild()}
          {currentQuestion.type === 'wheel_spin' && renderWheel()}
          {currentQuestion.type === 'odd_one' && renderOddOne()}
          {currentQuestion.type === 'sort' && renderSort()}

          {/* Fallback for Wheel Result (Quiz wrapper) */}
          {currentQuestion.isWheelResult && currentQuestion.type === 'quiz' && (
              <div className="absolute top-4 bg-orange-100 text-orange-600 px-4 py-1 rounded-full text-sm font-bold animate-pulse">
                  Bonus Round!
              </div>
          )}

       </div>
    </div>
  );
};