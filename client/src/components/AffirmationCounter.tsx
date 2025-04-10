import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, Target, CheckCircle, Edit, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { CountItem } from "@/types/affirmations";
import { affirmationDB, getTodayDateString } from "@/lib/db";

interface AffirmationCounterProps {
  transcript: string;
  selectedDate?: string; // Optional date in YYYY-MM-DD format
  readOnly?: boolean; // For viewing history
}

export default function AffirmationCounter({ 
  transcript, 
  selectedDate = getTodayDateString(),
  readOnly = false 
}: AffirmationCounterProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'positive' | 'negative'>('positive');
  const lastProcessedTranscriptRef = useRef<string>("");
  
  const [positiveAffirmations, setPositiveAffirmations] = useState<CountItem[]>([
    { text: "I am confident", count: 0, target: 5, completed: false },
    { text: "I can do this", count: 0, target: 5, completed: false },
    { text: "I am worthy", count: 0, target: 5, completed: false }
  ]);
  
  const [negativeWords, setNegativeWords] = useState<CountItem[]>([
    { text: "can't", count: 0, target: 0, completed: false },
    { text: "impossible", count: 0, target: 0, completed: false },
    { text: "never", count: 0, target: 0, completed: false }
  ]);

  const [newPositiveItem, setNewPositiveItem] = useState("");
  const [newPositiveTarget, setNewPositiveTarget] = useState("5");
  const [newNegativeItem, setNewNegativeItem] = useState("");
  const [newNegativeTarget, setNewNegativeTarget] = useState("0");
  
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingTarget, setEditingTarget] = useState("");

  // Save current state to database - using useCallback to avoid dependency cycle
  const saveToDatabase = useCallback(async () => {
    if (readOnly) return;
    
    try {
      await affirmationDB.saveRecord({
        date: selectedDate,
        positiveAffirmations,
        negativeWords
      });
    } catch (error) {
      console.error("Error saving to database:", error);
    }
  }, [selectedDate, positiveAffirmations, negativeWords, readOnly]);

  // Load data from the database based on selected date
  useEffect(() => {
    const loadData = async () => {
      try {
        const record = await affirmationDB.getRecord(selectedDate);
        
        if (record) {
          setPositiveAffirmations(record.positiveAffirmations);
          setNegativeWords(record.negativeWords);
        } else if (selectedDate !== getTodayDateString()) {
          // If it's not today and no record exists, try to load the previous day's data
          const allRecords = await affirmationDB.getAllRecords();
          const sortedDates = allRecords
            .map(r => r.date)
            .sort()
            .filter(date => date < selectedDate);
          
          if (sortedDates.length > 0) {
            const latestPreviousDate = sortedDates[sortedDates.length - 1];
            const previousRecord = await affirmationDB.getRecord(latestPreviousDate);
            
            if (previousRecord) {
              // Copy previous day's data but reset the counts
              setPositiveAffirmations(previousRecord.positiveAffirmations.map(item => ({
                ...item,
                count: 0,
                completed: false
              })));
              
              setNegativeWords(previousRecord.negativeWords.map(item => ({
                ...item,
                count: 0,
                completed: false
              })));
            }
          }
          
          // Save this new day's data
          saveToDatabase();
        } else {
          // It's today but no record exists yet, so create one with default data
          saveToDatabase();
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    
    loadData();
  }, [selectedDate]);

  // Count all phrases every time, but only on the NEW part of the transcript
  useEffect(() => {
    // Skip processing if in read-only mode or on a date other than today
    if (readOnly || selectedDate !== getTodayDateString()) return;
    
    // Skip empty transcripts
    if (!transcript || !transcript.trim()) return;
    
    // If we haven't changed at all, skip processing
    if (transcript === lastProcessedTranscriptRef.current) return;
    
    // Get only the new part of the transcript
    const newTranscriptPart = transcript.slice(lastProcessedTranscriptRef.current.length);
    
    // If no new content, just update the ref and return
    if (!newTranscriptPart.trim()) {
      lastProcessedTranscriptRef.current = transcript;
      return;
    }
    
    // Process the new transcript part for positive affirmations
    setPositiveAffirmations(prevAffirmations => {
      const updated = prevAffirmations.map(item => {
        // Create a simple case-insensitive regex for the phrase
        // Using lookahead/lookbehind for more accurate phrase matching
        const escapedText = item.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(?<![\\w])${escapedText}(?![\\w])`, 'gi');
        
        // Find all matches in the new part only - using exec instead of matchAll to avoid linter errors
        let matches = [];
        let match;
        while ((match = regex.exec(newTranscriptPart)) !== null) {
          matches.push(match);
        }
        const occurrences = matches.length;
        
        // Only update if new occurrences found
        if (occurrences > 0) {
          const newCount = item.count + occurrences;
          const wasCompleted = item.completed;
          const completed = item.target > 0 && newCount >= item.target;
          
          // Show toast only on newly completed items
          if (completed && !wasCompleted) {
            toast({
              title: "Target Reached! 🎉",
              description: `You've reached your target of saying "${item.text}" ${item.target} times!`,
              duration: 5000,
            });
          }
          
          return { 
            ...item, 
            count: newCount,
            completed: completed
          };
        }
        
        // No changes needed
        return item;
      });

      // Save after update
      setTimeout(() => saveToDatabase(), 0);
      
      return updated;
    });
    
    // Process for negative words with the same approach
    setNegativeWords(prevWords => {
      const updated = prevWords.map(item => {
        const escapedText = item.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(?<![\\w])${escapedText}(?![\\w])`, 'gi');
        
        // Find all matches using exec instead of matchAll
        let matches = [];
        let match;
        while ((match = regex.exec(newTranscriptPart)) !== null) {
          matches.push(match);
        }
        const occurrences = matches.length;
        
        if (occurrences > 0) {
          const newCount = item.count + occurrences;
          const wasCompleted = item.completed;
          const completed = item.target > 0 && newCount >= item.target;
          
          if (completed && !wasCompleted) {
            toast({
              title: "Target Reached",
              description: `You've used "${item.text}" ${newCount} times, which is above your target.`,
              duration: 5000,
            });
          }
          
          return { 
            ...item, 
            count: newCount,
            completed: completed
          };
        }
        
        return item;
      });

      // Save after update
      setTimeout(() => saveToDatabase(), 0);
      
      return updated;
    });
    
    // Always update our reference to what we've processed
    lastProcessedTranscriptRef.current = transcript;
    
  }, [transcript, toast, readOnly, selectedDate]);

  // Save to database whenever affirmations or negative words change
  useEffect(() => {
    // Don't save if we're in read-only mode
    if (readOnly) return;
    
    saveToDatabase();
  }, [positiveAffirmations, negativeWords, readOnly, selectedDate, saveToDatabase]);

  // Add a new positive affirmation
  const addPositiveItem = () => {
    if (readOnly) return;
    
    if (newPositiveItem.trim()) {
      const target = parseInt(newPositiveTarget) || 5;
      setPositiveAffirmations([
        ...positiveAffirmations, 
        { 
          text: newPositiveItem.trim(), 
          count: 0, 
          target: target,
          completed: false
        }
      ]);
      setNewPositiveItem("");
      setNewPositiveTarget("5");
    }
  };

  // Add a new negative word
  const addNegativeItem = () => {
    if (readOnly) return;
    
    if (newNegativeItem.trim()) {
      const target = parseInt(newNegativeTarget) || 0;
      setNegativeWords([
        ...negativeWords, 
        { 
          text: newNegativeItem.trim(), 
          count: 0,
          target: target,
          completed: false
        }
      ]);
      setNewNegativeItem("");
      setNewNegativeTarget("0");
    }
  };

  // Remove a positive affirmation
  const removePositiveItem = (index: number) => {
    if (readOnly) return;
    
    setPositiveAffirmations(positiveAffirmations.filter((_, i) => i !== index));
  };

  // Remove a negative word
  const removeNegativeItem = (index: number) => {
    if (readOnly) return;
    
    setNegativeWords(negativeWords.filter((_, i) => i !== index));
  };

  // Reset all counters
  const resetAllCounters = () => {
    if (readOnly) return;
    
    lastProcessedTranscriptRef.current = "";
    setPositiveAffirmations(positiveAffirmations.map(item => ({ ...item, count: 0, completed: false })));
    setNegativeWords(negativeWords.map(item => ({ ...item, count: 0, completed: false })));
  };

  // Start editing target
  const startEditing = (index: number, isPositive: boolean) => {
    if (readOnly) return;
    
    setEditingIndex(index);
    if (isPositive) {
      setEditingTarget(positiveAffirmations[index].target.toString());
    } else {
      setEditingTarget(negativeWords[index].target.toString());
    }
  };

  // Save edited target
  const saveTargetEdit = (isPositive: boolean) => {
    if (readOnly || editingIndex === null) return;
    
    const target = parseInt(editingTarget) || 0;
    
    if (isPositive) {
      setPositiveAffirmations(prev => {
        const updated = [...prev];
        updated[editingIndex] = {
          ...updated[editingIndex],
          target: target,
          completed: updated[editingIndex].count >= target && target > 0
        };
        return updated;
      });
    } else {
      setNegativeWords(prev => {
        const updated = [...prev];
        updated[editingIndex] = {
          ...updated[editingIndex],
          target: target,
          completed: updated[editingIndex].count === 0 && target === 0
        };
        return updated;
      });
    }
    
    setEditingIndex(null);
    setEditingTarget("");
  };

  // Calculate progress percentage for progress bars
  const calculateProgress = (count: number, target: number) => {
    if (target <= 0) return 0;
    const percentage = (count / target) * 100;
    return Math.min(percentage, 100);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Affirmation Counter</span>
          {!readOnly && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={resetAllCounters}
              className="text-slate-500 hover:text-slate-800"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Reset Counts
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Custom tabs */}
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
              <div 
                key={index} 
                className={`p-3 border rounded-md ${
                  item.completed ? 'border-green-200 bg-green-50' : 'border-slate-200'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-800 font-medium flex items-center">
                    {item.text}
                    {item.completed && (
                      <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
                    )}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant={item.count > 0 ? "default" : "outline"} className="min-w-[2.5rem] text-center">
                      {item.count}
                    </Badge>
                    
                    {!readOnly && editingIndex === index ? (
                      <div className="flex items-center">
                        <Input
                          type="number"
                          min="0"
                          value={editingTarget}
                          onChange={(e) => setEditingTarget(e.target.value)}
                          className="w-16 h-8 text-xs mr-1"
                          autoFocus
                          onKeyDown={(e) => e.key === 'Enter' && saveTargetEdit(true)}
                        />
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => saveTargetEdit(true)}
                          className="h-8 w-8 p-0"
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <span className="text-xs text-slate-500 flex items-center">
                          <Target className="h-3 w-3 mr-1" />
                          {item.target}
                        </span>
                        {!readOnly && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => startEditing(index, true)}
                            className="h-8 w-8 p-0 ml-1"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    )}
                    
                    {!readOnly && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removePositiveItem(index)}
                        className="text-slate-400 hover:text-slate-800 h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Progress bar */}
                {item.target > 0 && (
                  <div className="w-full bg-slate-100 rounded-full h-2 mt-1">
                    <div 
                      className={`h-2 rounded-full ${item.completed ? 'bg-green-500' : 'bg-blue-500'}`}
                      style={{ width: `${calculateProgress(item.count, item.target)}%` }}
                    ></div>
                  </div>
                )}
              </div>
            ))}
            
            {!readOnly && (
              <div className="flex gap-2 mt-3 flex-wrap">
                <Input
                  placeholder="Add positive affirmation..."
                  value={newPositiveItem}
                  onChange={(e) => setNewPositiveItem(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addPositiveItem()}
                  className="flex-1"
                />
                <div className="flex items-center">
                  <span className="text-sm text-slate-500 mr-2">Target:</span>
                  <Input
                    type="number"
                    min="1"
                    placeholder="5"
                    value={newPositiveTarget}
                    onChange={(e) => setNewPositiveTarget(e.target.value)}
                    className="w-16 text-center"
                  />
                </div>
                <Button onClick={addPositiveItem}>
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            )}
          </div>
        )}
        
        {/* Negative words content */}
        {activeTab === 'negative' && (
          <div className="grid gap-2">
            {negativeWords.map((item, index) => (
              <div 
                key={index} 
                className={`p-3 border rounded-md ${
                  item.count === 0 ? 'border-green-200 bg-green-50' : 'border-slate-200'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-800 font-medium flex items-center">
                    {item.text}
                    {item.count === 0 && (
                      <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
                    )}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant={item.count > 0 ? "destructive" : "outline"} className="min-w-[2.5rem] text-center">
                      {item.count}
                    </Badge>
                    
                    {!readOnly && editingIndex === index ? (
                      <div className="flex items-center">
                        <Input
                          type="number"
                          min="0"
                          value={editingTarget}
                          onChange={(e) => setEditingTarget(e.target.value)}
                          className="w-16 h-8 text-xs mr-1"
                          autoFocus
                          onKeyDown={(e) => e.key === 'Enter' && saveTargetEdit(false)}
                        />
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => saveTargetEdit(false)}
                          className="h-8 w-8 p-0"
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <span className="text-xs text-slate-500 flex items-center">
                          <Target className="h-3 w-3 mr-1" />
                          {item.target}
                        </span>
                        {!readOnly && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => startEditing(index, false)}
                            className="h-8 w-8 p-0 ml-1"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    )}
                    
                    {!readOnly && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeNegativeItem(index)}
                        className="text-slate-400 hover:text-slate-800 h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* For negative words, we show how many times they've said it */}
                {item.count > 0 && (
                  <div className="w-full bg-slate-100 rounded-full h-2 mt-1">
                    <div 
                      className="h-2 rounded-full bg-red-500"
                      style={{ width: `${Math.min(item.count * 20, 100)}%` }}
                    ></div>
                  </div>
                )}
              </div>
            ))}
            
            {!readOnly && (
              <div className="flex gap-2 mt-3 flex-wrap">
                <Input
                  placeholder="Add word to avoid..."
                  value={newNegativeItem}
                  onChange={(e) => setNewNegativeItem(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addNegativeItem()}
                  className="flex-1"
                />
                <div className="flex items-center">
                  <span className="text-sm text-slate-500 mr-2">Target:</span>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={newNegativeTarget}
                    onChange={(e) => setNewNegativeTarget(e.target.value)}
                    className="w-16 text-center"
                  />
                </div>
                <Button onClick={addNegativeItem}>
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}