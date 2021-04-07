import { Buffer, Column, Workbook } from 'exceljs'

// prevent required fields form library
export type ColumnDefinition = Partial<Column>
export class ExportService {
    async generateExport(data: any): Promise<Buffer> {
        const template = `src/export/bill.xlsx`
        const workbook = await new Workbook().xlsx.readFile(template)
        const worksheet = workbook.getWorksheet(1)
        worksheet.addRows(data, 'i+')
        worksheet.spliceRows(2, 1)
        return workbook.xlsx.writeBuffer()
    }
}
