import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Upload, Save } from "lucide-react";
import { affirmationDB } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";

export function ImportExportData() {
  const { toast } = useToast();
  const [exportData, setExportData] = useState("");
  const [importData, setImportData] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("export");
  
  // Handle exporting data
  const handleExport = async () => {
    try {
      const data = await affirmationDB.exportData();
      setExportData(data);
      setActiveTab("export");
      setDialogOpen(true);
    } catch (error) {
      toast({
        title: "Export Error",
        description: "There was an error exporting your data.",
        variant: "destructive",
      });
    }
  };
  
  // Handle importing data
  const handleImport = async () => {
    try {
      await affirmationDB.importData(importData);
      setDialogOpen(false);
      toast({
        title: "Import Successful",
        description: "Your data has been imported successfully.",
      });
      // Force reload to reflect changes
      window.location.reload();
    } catch (error) {
      toast({
        title: "Import Error",
        description: "There was an error importing your data. Make sure the JSON is valid.",
        variant: "destructive",
      });
    }
  };
  
  // Download export data as a file
  const downloadExportFile = () => {
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `affirmation-data-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Handle file upload for import
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImportData(event.target.result as string);
      }
    };
    reader.readAsText(file);
  };
  
  return (
    <>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
        <Button variant="outline" size="sm" onClick={() => {
          setImportData("");
          setActiveTab("import");
          setDialogOpen(true);
        }}>
          <Upload className="h-4 w-4 mr-2" />
          Import Data
        </Button>
      </div>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Import/Export Data</DialogTitle>
            <DialogDescription>
              Backup your affirmation history or restore from a previous backup.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="export">Export</TabsTrigger>
              <TabsTrigger value="import">Import</TabsTrigger>
            </TabsList>
            
            <TabsContent value="export" className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-500">
                  This is your affirmation data in JSON format. You can copy it or download it as a file.
                </p>
                <div className="relative">
                  <textarea
                    className="w-full h-48 p-2 border rounded font-mono text-xs"
                    value={exportData}
                    readOnly
                  />
                </div>
                <Button onClick={downloadExportFile} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download as File
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="import" className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-500">
                  Upload a JSON file or paste your backup data below.
                </p>
                <Input 
                  type="file" 
                  accept=".json" 
                  onChange={handleFileUpload} 
                  className="cursor-pointer"
                />
                <p className="text-xs text-gray-500 my-2">Or paste your JSON data:</p>
                <textarea
                  className="w-full h-48 p-2 border rounded font-mono text-xs"
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  placeholder='[{"date":"2023-01-01","positiveAffirmations":[...],"negativeWords":[...]}]'
                />
                <div className="bg-yellow-50 p-2 rounded text-xs text-amber-700 mb-2">
                  <strong>Warning:</strong> Importing data will replace all your current data.
                  Make sure to export your current data first if you want to keep it.
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            {activeTab === "import" && (
              <Button onClick={handleImport} disabled={!importData.trim()}>
                <Save className="h-4 w-4 mr-2" />
                Import Data
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 