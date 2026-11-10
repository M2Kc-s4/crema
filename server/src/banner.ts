function color(hue: number) {
    const f = (n: number) => {
        const k = (n + hue / 30) % 12
        return Math.round((0.6 - 0.36 * Math.max(-1, Math.min(k - 3, 9 - k, 1))) * 255)
    }
    return `\x1b[1;38;2;${f(0)};${f(8)};${f(4)}m`
}

const sparkle = (x: number, y: number, f: number) => (x * 31 + y * 17 + (f >> 2) * 13) % 41 === 0

function frame(f: number, frames: number, width: number, banner: string[]) {
    const reveal = (f / (frames * 0.55)) * (width + 4)
    const glint = (f * 2) % (width + 40) - 10
    return banner.map((line, y) =>
        "  " +
        [...line.padEnd(width)]
        .map((c, x) => c === " "
            ? (x <= reveal && sparkle(x, y, f) ? color(x * 7 + f * 14) + "·" : " ")
            : x > reveal ? " " : (Math.abs(x + y * 2 - glint) < 2 ? "\x1b[1;97m" : color(x * 7 + y * 22 + f * 14)) + c
        )
        .join("") +
        "\x1b[0m"
    ).join("\n")
}

const g = globalThis as any

export async function banner(arts: string[], fps = 20, hold = 1.5) {
    const lines = arts.map(a => a.split("\n").slice(1, -1))
    const width = Math.max(...lines.flat().map(l => l.length))
    const height = Math.max(...lines.map(a => a.length)) + 1
    lines.forEach(a => {
        while (a.length < height - 1) a.push("")
        a.push("━".repeat(width))
    })
    const frames = 46

    g.__bannerStop?.()
    let running = true
    g.__bannerStop = () => running = false
    g.__bannerHeight = height

    if (!g.__bannerInit) {
        g.__bannerInit = true
        process.on("exit", () => process.stdout.write(`\x1b[0m\x1b[${g.__bannerHeight}B\x1b[?25h\n`))
        process.on("SIGINT", () => process.exit())
        process.on("SIGTERM", () => process.exit())
    }

    process.stdout.write("\x1b[2J\x1b[3J\x1b[H\x1b[0m\x1b[?25l\n")
    for (let f = 0; running; f++) {
        const art = lines[Math.floor(f / (fps * hold)) % lines.length]!
        process.stdout.write(frame(f, frames, width, art) + "\n" + `\x1b[${height}A`)
        await new Promise(r => setTimeout(r, 1000 / fps))
    }
}