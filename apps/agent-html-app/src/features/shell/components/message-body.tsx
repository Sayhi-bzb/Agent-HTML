type MessageBodyProps = {
  text?: string
  items?: string[]
}

export function MessageBody({ text, items = [] }: MessageBodyProps) {
  if (items.length > 0) {
    return (
      <ul className="app-shell-body-list">
        {items.map((item) => (
          <li className="app-shell-body-item" key={item}>
            {item}
          </li>
        ))}
      </ul>
    )
  }

  return <p className="app-shell-body-copy">{text}</p>
}
