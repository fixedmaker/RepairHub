import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Device } from '../types';
import { format } from 'date-fns';

export const pdfExport = {
  devices: (devices: Device[], title: string = 'Laporan Perbaikan Barang') => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('RepairHub', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(title, 14, 30);
    doc.text(`Dicetak pada: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 36);

    const tableData = devices.map(d => [
      d.id,
      `${d.type} ${d.brand} ${d.model}`,
      d.customerName,
      d.status,
      d.technicianName || '-',
      format(new Date(d.entryDate), 'dd/MM/yyyy')
    ]);

    autoTable(doc, {
      head: [['ID', 'Unit', 'Pelanggan', 'Status', 'Teknisi', 'Tgl Masuk']],
      body: tableData,
      startY: 45,
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [239, 68, 68] },
    });

    doc.save(`repairhub-devices-${format(new Date(), 'yyyyMMdd-HHmm')}.pdf`);
  },

  deviceReceipt: (device: Device) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(239, 68, 68);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('RepairHub', 14, 25);
    doc.setFontSize(10);
    doc.text('TANDA TERIMA SERVIS DIGITAL', 14, 32);

    // Body
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text('DETAIL PERBAIKAN', 14, 55);
    doc.setFontSize(10);
    doc.text(`No. Antrian: #${device.id.toUpperCase()}`, 14, 62);
    doc.text(`Tanggal: ${format(new Date(device.entryDate), 'dd MMMM yyyy')}`, 14, 68);

    // Customer Info
    doc.setFontSize(12);
    doc.text('DATA PELANGGAN', 14, 85);
    doc.setFontSize(10);
    doc.text(`Nama: ${device.customerName}`, 14, 92);

    // Device Info
    doc.setFontSize(12);
    doc.text('UNIT & KELUHAN', 14, 110);
    doc.setFontSize(10);
    doc.text(`Unit: ${device.type} ${device.brand} ${device.model}`, 14, 117);
    doc.text(`Serial No: ${device.serialNumber || '-'}`, 14, 123);
    doc.text('Keluhan:', 14, 129);
    doc.setFontSize(9);
    const splitDamage = doc.splitTextToSize(device.damageDescription, 180);
    doc.text(splitDamage, 14, 135);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('Harap simpan tanda terima ini untuk pengambilan barang.', 14, 280);
    doc.text('RepairHub - Digital Repair Management System', 105, 280, { align: 'center' });

    doc.save(`receipt-${device.id}.pdf`);
  }
};
