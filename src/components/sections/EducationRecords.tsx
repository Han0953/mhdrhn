import { educationRecords } from "@/lib/education";

/** Shared, server-rendered education records for Home and About. */
export function EducationRecords() {
  return <div className="education-records">
    {educationRecords.map(record => <article className="education-record" key={record.id} data-education-id={record.id}>
      <div className="education-record-top"><p className="meta">{record.period}</p><p className="eyebrow">{record.level}</p></div>
      <div className="education-record-copy"><h3>{record.institution}</h3><p>{record.program}</p>{record.recognition && <p className="education-recognition">{record.recognition}</p>}</div>
      <dl className="education-score"><dt>{record.scoreLabel}</dt><dd><span>{record.scoreDisplay}</span><span className="education-score-scale">/{record.scoreMaxDisplay}</span></dd></dl>
    </article>)}
  </div>;
}
