import { CountItem } from "@/types/affirmations";

export interface DailyRecord {
  date: string; // ISO format: YYYY-MM-DD
  positiveAffirmations: CountItem[];
  negativeWords: CountItem[];
}

const DB_NAME = "affirmation-tracker";
const DB_VERSION = 1;
const STORE_NAME = "daily-records";

export class AffirmationDB {
  private db: IDBDatabase | null = null;

  async open(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create the object store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: "date" });
          store.createIndex("date", "date", { unique: true });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onerror = (event) => {
        console.error("IndexedDB error:", (event.target as IDBOpenDBRequest).error);
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  }

  async saveRecord(record: DailyRecord): Promise<void> {
    if (!this.db) await this.open();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      
      const request = store.put(record);
      
      request.onsuccess = () => resolve();
      request.onerror = (event) => {
        console.error("Error saving record:", (event.target as IDBRequest).error);
        reject((event.target as IDBRequest).error);
      };
    });
  }

  async getRecord(date: string): Promise<DailyRecord | null> {
    if (!this.db) await this.open();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      
      const request = store.get(date);
      
      request.onsuccess = () => {
        resolve(request.result || null);
      };
      
      request.onerror = (event) => {
        console.error("Error getting record:", (event.target as IDBRequest).error);
        reject((event.target as IDBRequest).error);
      };
    });
  }

  async getAllRecords(): Promise<DailyRecord[]> {
    if (!this.db) await this.open();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      
      // Use index to get records in date order
      const index = store.index("date");
      const request = index.getAll();
      
      request.onsuccess = () => {
        // Sort by date descending (newest first) before returning
        const records = request.result || [];
        records.sort((a, b) => b.date.localeCompare(a.date));
        resolve(records);
      };
      
      request.onerror = (event) => {
        console.error("Error getting all records:", (event.target as IDBRequest).error);
        reject((event.target as IDBRequest).error);
      };
    });
  }

  async deleteRecord(date: string): Promise<void> {
    if (!this.db) await this.open();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      
      const request = store.delete(date);
      
      request.onsuccess = () => resolve();
      request.onerror = (event) => {
        console.error("Error deleting record:", (event.target as IDBRequest).error);
        reject((event.target as IDBRequest).error);
      };
    });
  }

  async exportData(): Promise<string> {
    const records = await this.getAllRecords();
    return JSON.stringify(records, null, 2);
  }

  async importData(jsonData: string): Promise<void> {
    try {
      const records = JSON.parse(jsonData) as DailyRecord[];
      
      if (!Array.isArray(records)) {
        throw new Error("Invalid data format: expected an array");
      }
      
      // Validate records
      records.forEach(record => {
        if (!record.date || !record.positiveAffirmations || !record.negativeWords) {
          throw new Error("Invalid record format");
        }
      });
      
      // Clear existing data and import new data
      if (!this.db) await this.open();
      
      const transaction = this.db!.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      
      // Clear existing data
      store.clear();
      
      // Add all records
      for (const record of records) {
        store.add(record);
      }
      
      return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = (event) => {
          console.error("Error importing data:", transaction.error);
          reject(transaction.error);
        };
      });
    } catch (error) {
      console.error("Error parsing imported data:", error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const affirmationDB = new AffirmationDB();

// Helper function to get today's date in YYYY-MM-DD format using local time
export const getTodayDateString = (): string => {
  // Create new date object for current time
  const now = new Date();
  console.log('Raw Date object in getTodayDateString:', now);
  console.log('Raw Date toString():', now.toString());
  console.log('Date timezone offset in minutes:', now.getTimezoneOffset());
  
  // Get current timezone offset in milliseconds
  const timezoneOffset = now.getTimezoneOffset() * 60000;
  
  // Create a date that's adjusted for the timezone
  const today = new Date(now.getTime() - timezoneOffset);
  console.log('Timezone adjusted date:', today);
  
  // Use toISOString() which gives YYYY-MM-DDTHH:mm:ss.sssZ format
  // and then take just the date part (YYYY-MM-DD)
  const dateString = today.toISOString().split('T')[0];
  console.log('ISO date string (YYYY-MM-DD):', dateString);
  
  return dateString;
};

// Helper function to format a date for display (e.g., "Monday, Jan 1, 2023")
export const formatDateForDisplay = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}; 