import js from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ['out/**', 'dist/**', 'node_modules/**', '*.config.js', '*.config.ts']
  },
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      // console.log 경고 (error로 설정하면 커밋 차단)
      'no-console': ['error', { allow: ['warn', 'error'] }],
      // switch case 내 변수 선언 허용
      'no-case-declarations': 'off',
      // TypeScript 관련 규칙 완화
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-empty-object-type': 'off'
    }
  }
)
