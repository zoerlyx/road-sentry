// src/mocks/mockData.js
export const mockReports = [
  {
    _id: "rep-001",
    title: "Jalan Berlubang Parah",
    description: "Lubang cukup dalam sekitar 50cm di jalur sebelah kiri.",
    location: {
      latitude: -6.8915,
      longitude: 107.5982,
      address: "Jl. Sukajadi No. 123, Bandung"
    },
    status: "PENDING",
    severity: "HIGH",
    imageUrl: "https://via.placeholder.com/600x400?text=Foto+Jalan+Berlubang",
    createdAt: new Date().toISOString()
  },
  {
    _id: "rep-002",
    title: "Retak Buaya Panjang",
    description: "Permukaan jalan retak-retak berpotensi mengelupas saat hujan.",
    location: {
      latitude: -6.8850,
      longitude: 107.6135,
      address: "Jl. Ir. H. Juanda, Dago"
    },
    status: "PROCESSED",
    severity: "MEDIUM",
    imageUrl: "https://via.placeholder.com/600x400?text=Foto+Retak+Jalan",
    createdAt: new Date().toISOString()
  }
];

export const mockStats = {
  totalReports: 15,
  pendingReports: 6,
  processedReports: 9,
  highSeverity: 4
};