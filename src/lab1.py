path = "./plik.txt"

with open(path, "r", encoding="utf-8", errors="strict", newline="") as f:
    while True:
        ch = f.read(1)       # czytaj dokładnie 1 znak (nie 1 bajt!)
        if not ch:           # pusty string ⇒ EOF
            break
        print(ch, end='')  