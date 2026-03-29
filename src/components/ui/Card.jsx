function Card({ title, children }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      {title ? <h3 className="mb-3 text-base font-semibold">{title}</h3> : null}
      {children}
    </section>
  )
}

export default Card
