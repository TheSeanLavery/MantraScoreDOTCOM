import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";

interface CountItem {
  text: string;
  count: number;
}

interface AffirmationCounterProps {
  transcript: string;
}

export default function AffirmationCounter({ transcript }: AffirmationCounterProps) {
  const [activeTab, setActiveTab] = useState<'positive' | 'negative'>('positive');
  const [positiveAffirmations, setPositiveAffirmations] = useState<CountItem[]>([
    { text: "I am confident", count: 0 },
    { text: "I can do this", count: 0 },
    { text: "I am worthy", count: 0 }
  ]);
  
  const [negativeWords, setNegativeWords] = useState<CountItem[]>([
    { text: "can't", count: 0 },
    { text: "impossible", count: 0 },
    { text: "never", count: 0 }
  ]);

  const [newPositiveItem, setNewPositiveItem] = useState("");
  const [newNegativeItem, setNewNegativeItem] = useState("");

  // Process transcript to count occurrences
  useEffect(() => {
    // Only run if transcript isn't empty
    if (!transcript.trim()) return;

    // Process the transcript for positive affirmations
    setPositiveAffirmations(prevAffirmations => {
      return prevAffirmations.map(item => {
        // Create a regex to match the word/phrase with word boundaries
        const regex = new RegExp(`\\b${item.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        const matches = transcript.match(regex);
        const occurrences = matches ? matches.length : 0;
        
        // Only update if new occurrences are found
        if (occurrences > 0) {
          return { ...item, count: item.count + occurrences };
        }
        return item;
      });
    });
    
    // Process the transcript for negative words
    setNegativeWords(prevWords => {
      return prevWords.map(item => {
        const regex = new RegExp(`\\b${item.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        const matches = transcript.match(regex);
        const occurrences = matches ? matches.length : 0;
        
        if (occurrences > 0) {
          return { ...item, count: item.count + occurrences };
        }
        return item;
      });
    });
    
  }, [transcript]);

  // Add a new positive affirmation
  const addPositiveItem = () => {
    if (newPositiveItem.trim()) {
      setPositiveAffirmations([
        ...positiveAffirmations, 
        { text: newPositiveItem.trim(), count: 0 }
      ]);
      setNewPositiveItem("");
    }
  };

  // Add a new negative word
  const addNegativeItem = () => {
    if (newNegativeItem.trim()) {
      setNegativeWords([
        ...negativeWords, 
        { text: newNegativeItem.trim(), count: 0 }
      ]);
      setNewNegativeItem("");
    }
  };

  // Remove a positive affirmation
  const removePositiveItem = (index: number) => {
    setPositiveAffirmations(positiveAffirmations.filter((_, i) => i !== index));
  };

  // Remove a negative word
  const removeNegativeItem = (index: number) => {
    setNegativeWords(negativeWords.filter((_, i) => i !== index));
  };

  // Reset all counters
  const resetAllCounters = () => {
    setPositiveAffirmations(positiveAffirmations.map(item => ({ ...item, count: 0 })));
    setNegativeWords(negativeWords.map(item => ({ ...item, count: 0 })));
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Affirmation Counter</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={resetAllCounters}
            className="text-slate-500 hover:text-slate-800"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Reset Counts
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Custom tabs instead of shadcn Tabs */}
        <div className="mb-4 w-full flex border rounded-lg overflow-hidden">
          <button 
            className={`flex-1 py-2 px-4 text-center ${activeTab === 'positive' 
              ? 'bg-blue-100 text-blue-800 font-medium' 
              : 'bg-white text-slate-700 hover:bg-slate-50'}`}
            onClick={() => setActiveTab('positive')}
          >
            Positive Affirmations
          </button>
          <button 
            className={`flex-1 py-2 px-4 text-center ${activeTab === 'negative' 
              ? 'bg-blue-100 text-blue-800 font-medium' 
              : 'bg-white text-slate-700 hover:bg-slate-50'}`}
            onClick={() => setActiveTab('negative')}
          >
            Words to Avoid
          </button>
        </div>
        
        {/* Positive affirmations content */}
        {activeTab === 'positive' && (
          <div className="grid gap-2">
            {positiveAffirmations.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-2 border border-slate-200 rounded-md">
                <span className="text-slate-800">{item.text}</span>
                <div className="flex items-center gap-2">
                  <Badge variant={item.count > 0 ? "default" : "outline"}>
                    {item.count}
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removePositiveItem(index)}
                    className="text-slate-400 hover:text-slate-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Add positive affirmation..."
                value={newPositiveItem}
                onChange={(e) => setNewPositiveItem(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addPositiveItem()}
                className="flex-1"
              />
              <Button onClick={addPositiveItem}>
                <PlusCircle className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </div>
        )}
        
        {/* Negative words content */}
        {activeTab === 'negative' && (
          <div className="grid gap-2">
            {negativeWords.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-2 border border-slate-200 rounded-md">
                <span className="text-slate-800">{item.text}</span>
                <div className="flex items-center gap-2">
                  <Badge variant={item.count > 0 ? "destructive" : "outline"}>
                    {item.count}
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeNegativeItem(index)}
                    className="text-slate-400 hover:text-slate-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Add word to avoid..."
                value={newNegativeItem}
                onChange={(e) => setNewNegativeItem(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addNegativeItem()}
                className="flex-1"
              />
              <Button onClick={addNegativeItem}>
                <PlusCircle className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}