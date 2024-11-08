import React, { useState } from 'react';
import { Upload, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useDatabase } from '../hooks/useDatabase';
import type { Tenant, Apartment } from '../types';

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

interface ExcelApartment {
  street: string;
  number: string;
  apartmentNumber: string;
  floor: string;
  postalCode: string;
  city: string;
}

export function ImportData() {
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const { insertItem: insertTenant } = useDatabase<Tenant>('tenants');
  const { insertItem: insertApartment, items: apartments } = useDatabase<Apartment>('apartments');

  const processExcelData = async (data: any[]) => {
    try {
      // First, process apartments to ensure they exist
      const uniqueApartments = new Map<string, ExcelApartment>();
      
      data.forEach((row) => {
        if (row.street && row.number && row.apartmentNumber) {
          const key = `${row.street}-${row.number}-${row.apartmentNumber}`;
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

      // Insert apartments and keep track of their IDs
      const apartmentMap = new Map<string, string>();
      for (const [key, apt] of uniqueApartments.entries()) {
        const newApartment = await insertApartment(apt);
        apartmentMap.set(key, newApartment.id!);
      }

      // Process tenants and link them to apartments
      for (const row of data) {
        if (row.firstName && row.lastName && row.personalNumber) {
          const apartmentKey = row.street && row.number && row.apartmentNumber
            ? `${row.street}-${row.number}-${row.apartmentNumber}`
            : null;

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      setError(null);

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);

          await processExcelData(jsonData);
          alert('Data imported successfully!');
          event.target.value = ''; // Reset file input
        } catch (err) {
          console.error('Error reading Excel file:', err);
          setError('Failed to process Excel file. Please check the format.');
        } finally {
          setImporting(false);
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.error('Error handling file upload:', err);
      setError('Failed to read file');
      setImporting(false);
    }
  };

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
          <Upload className="w-5 h-5 mr-2" />
          {importing ? 'Importing...' : 'Choose Excel File'}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/50 rounded-md flex items-start">
          <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
        </div>
      )}
    </div>
  );
}