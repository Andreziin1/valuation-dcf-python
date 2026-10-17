type Props = {
  id: string; label: string; value: string; onChange: (value: string) => void
  error?: string; hint?: string; suffix?: string; text?: boolean; readOnly?: boolean; source?: string
}
export default function Field({ id, label, value, onChange, error, hint, suffix, text, readOnly, source }: Props) {
  return <div className={'field' + (error ? ' invalid' : '')}>
    <label htmlFor={id}>{label}{source && <span className="source">{source}</span>}</label>
    <div className={'input-wrap' + (readOnly ? ' readonly' : '')}>
      <input id={id} name={id} type="text" inputMode={text ? 'text' : 'decimal'} value={value}
        readOnly={readOnly} onChange={e => onChange(e.target.value)} autoComplete="off"
        maxLength={text ? 160 : 32} aria-invalid={!!error} aria-describedby={error || hint ? id + '-help' : undefined}
        placeholder={readOnly ? '' : text ? 'Nome da empresa' : 'Informe o valor'} />
      {suffix && <span aria-hidden="true">{suffix}</span>}
    </div>
    {(error || hint) && <small id={id + '-help'} className={error ? 'field-error' : 'field-hint'}>{error || hint}</small>}
  </div>
}
