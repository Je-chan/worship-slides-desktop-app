import { Button, Card, CardHeader, CardContent } from '@shared/ui'

interface BackupSettingsProps {
  isExporting: boolean
  onExport: () => void
  onImport: () => void
}

export function BackupSettings({
  isExporting,
  onExport,
  onImport
}: BackupSettingsProps): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <h2 className="font-semibold text-slate-900 dark:text-slate-100">데이터 백업/복원</h2>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          찬양 데이터를 백업하거나 다른 기기에서 내보낸 백업 파일을 가져올 수 있습니다.
        </p>
        <div className="flex gap-3">
          <Button onClick={onExport} disabled={isExporting}>
            {isExporting ? '내보내는 중...' : '백업 내보내기'}
          </Button>
          <Button variant="secondary" onClick={onImport}>
            백업 가져오기
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
