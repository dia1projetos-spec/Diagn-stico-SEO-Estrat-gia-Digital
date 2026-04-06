/**
 * ESTRUTURA DO BANCO DE DADOS - FIRESTORE
 * ========================================
 * 
 * users/
 *   {userId}/
 *     email: string
 *     name: string
 *     role: "admin" | "client"
 *     createdAt: timestamp
 *     adminId: string (se for client, referência ao admin que o criou)
 * 
 * sites/
 *   {siteId}/
 *     ownerId: string (userId do admin)
 *     clientId: string (userId do cliente)
 *     url: string
 *     name: string
 *     searchConsoleConnected: boolean
 *     searchConsoleToken: string (token OAuth criptografado)
 *     createdAt: timestamp
 * 
 *     reports/ (subcoleção)
 *       {reportId}/
 *         type: "seo_technical" | "content" | "ads_recommendation"
 *         score: number (0-100)
 *         issues: array
 *         suggestions: array
 *         createdAt: timestamp
 *         pdfUrl: string (link do Cloudinary)
 * 
 *     rankings/ (subcoleção)
 *       {date}/
 *         keywords: [{ keyword, position, clicks, impressions, ctr }]
 * 
 *     alerts/ (subcoleção)
 *       {alertId}/
 *         type: "position_drop" | "traffic_drop"
 *         message: string
 *         read: boolean
 *         createdAt: timestamp
 */

export {};
