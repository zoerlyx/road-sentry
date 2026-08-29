// src/mocks/reportsData.js
export const mockReports = [
  {
    id: "rep-001",
    title: "Jalan Berlubang Parah di Jl. Sukajadi",
    description: "Lubang diameter 50cm cukup dalam, membahayakan pengendara motor.",
    latitude: -6.8915,
    longitude: 107.5982,
    status: "PENDING",
    severity: "HIGH",
    imageUrl: "https://via.placeholder.com/400x300?text=Jalan+Berlubang",
    createdAt: new Date().toISOString(),
  },
  {
    id: "rep-002",
    title: "Retak Buaya dekat Simpang Dago",
    description: "Retakan memanjang di lajur kiri.",
    latitude: -6.8850,
    longitude: 107.6135,
    status: "PROCESSED",
    severity: "MEDIUM",
    imageUrl: "https://via.placeholder.com/400x300?text=Retak+Jalan",
    createdAt: new Date().toISOString(),
  }
];

export const mockStats = {
  totalReports: 12,
  pendingReports: 5,
  resolvedReports: 7,
};