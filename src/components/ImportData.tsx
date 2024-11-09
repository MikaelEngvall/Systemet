import React, { useState } from 'react';
import { Upload, AlertCircle } from 'lucide-react'; // Importing icons for file upload button and error display
import * as XLSX from 'xlsx'; // Importing the XLSX library to process Excel files
import { useDatabase } from '../hooks/useDatabase'; // Custom hook for database operations
import type { Tenant, Apartment } from '../types'; // Type imports for Tenant and Apartment objects

// Interface defining the structure of tenant data in the Excel file
interface ExcelTenant {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  personalNumber: string;
  moveInDate?: string;
  resiliationDate?: string;
  apartmentStreet?: string;
  apartmentNumber?: string;
  apartmentAptNumber?: string;
}

// Interface defining the structure of apartment data in the Excel file
interface ExcelApartment {
  street: string;
  number: string;
  apartmentNumber: string;
  floor: string;
  postalCode: string;
  city: string;
}

// ImportData component for importing tenant and apartment data from an Excel file
export function ImportData() {
  const [error, setError] = useState<string | null>(null); // Error message state
  const [importing, setImporting] = useState(false); // State to manage the import process status
  const { insertItem: insertTenant } = useDatabase<Tenant>('tenants'); // Function to insert tenant records
  const { insertItem: insertApartment, items: apartments } = useDatabase<Apartment>('apartments'); // Insert and fetch apartment records

  // Function to process and insert apartment and tenant data from the Excel file
  const processExcelData = async (data: any[]) => {
    try {
      // Process apartments first and ensure each is unique using a Map
      const uniqueApartments = new Map<string, ExcelApartment>();
      
      data.forEach((row) => {
        if (row.street && row.number && row.apartmentNumber) {
          const key = `${row.street}-${row.number}-${row.apartmentNumber}`; // Unique key for each apartment
          if (!uniqueApartments.has(key)) {
            uniqueApartments.set(key, {
              street: row.street,
              number: row.number,
              apartmentNumber: row.apartmentNumber,
              floor: row.floor || '1',
              postalCode: row.postalCode || '',
              city: row.city || '',
            });
          }
        }
      });

      // Insert each apartment into the database and map its unique ID
      const apartmentMap = new Map<string, string>();
      for (const [key, apt] of uniqueApartments.entries()) {
        const newApartment = await insertApartment(apt);
        apartmentMap.set(key, newApartment.id!);
      }

      // Process tenant data, linking each tenant to their apartment if available
      for (const row of data) {
        if (row.firstName && row.lastName && row.personalNumber) {
          const apartmentKey = row.street && row.number && row.apartmentNumber
            ? `${row.street}-${row.number}-${row.apartmentNumber}`
            : null;

          // Tenant object with fields from the Excel row and apartment link if applicable
          const tenant: Partial<Tenant> = {
            firstName: row.firstName,
            lastName: row.lastName,
            phoneNumber: row.phoneNumber || '',
            email: row.email || '',
            personalNumber: row.personalNumber,
            moveInDate: row.moveInDate || '',
            resiliationDate: row.resiliationDate || '',
            apartmentId: apartmentKey ? apartmentMap.get(apartmentKey) : undefined,
          };

          await insertTenant(tenant as Tenant);
        }
      }
    } catch (err) {
      console.error('Error processing Excel data:', err);
      throw new Error('Failed to process Excel data');
    }
  };

  // Handle file upload event and initiate processing of the Excel file
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true); // Set importing status to true to indicate processing
      setError(null);

      const reader = new FileReader(); // FileReader API to read the uploaded file
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer); // Convert file to byte array
          const workbook = XLSX.read(data, { type: 'array' }); // Read workbook data from byte array
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]]; // Access the first sheet in workbook
          const jsonData = XLSX.utils.sheet_to_json(firstSheet); // Convert sheet data to JSON format

          await processExcelData(jsonData); // Call the function to insert data into the database
          alert('Data imported successfully!');
          event.target.value = ''; // Reset file input after successful import
        } catch (err) {
          console.error('Error reading Excel file:', err);
          setError('Failed to process Excel file. Please check the format.');
        } finally {
          setImporting(false); // Reset importing status
        }
      };

      reader.readAsArrayBuffer(file); // Read file as ArrayBuffer for processing
    } catch (err) {
      console.error('Error handling file upload:', err);
      setError('Failed to read file');
      setImporting(false);
    }
  };

  // Render component UI, including file upload button and error messages
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Import Data from Excel</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Upload an Excel file with tenant and apartment data. The file should have the following columns:
        </p>
        <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mt-2">
          <li>firstName, lastName, phoneNumber, email, personalNumber</li>
          <li>moveInDate, resiliationDate (optional)</li>
          <li>street, number, apartmentNumber, floor, postalCode, city</li>
        </ul>
      </div>

      <div className="relative">
        {/* File input for uploading the Excel file */}
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          disabled={importing}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <button
          className={`w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium ${
            importing
              ? 'bg-gray-100 text-gray-400 dark:bg-gray-700'
              : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
          }`}
          disabled={importing}
        >
          <Upload className="w-5 h-5 mr-2" /> {/* Upload icon */}
          {importing ? 'Importing...' : 'Choose Excel File'}
        </button>
      </div>

      {/* Error message displayed if any errors occur during file processing */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/50 rounded-md flex items-start">
          <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
        </div>
      )}
    </div>
  );
}
