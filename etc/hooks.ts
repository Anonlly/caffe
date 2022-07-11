import { useState } from "react"

export function useForceUpdate(): () => void {
    const [value, setValue] = useState(0)
    return () => setValue(value => value + 1)
}