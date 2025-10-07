import { Container } from "./ui/container";

export function Footer({ className }: { className?: string }) {
  return (
    <footer className={`fixed bottom-0 left-0 w-full h-11 text-[#6c6c6c] text-right font-light text-sm z-30 ${className}`}>
      <Container variant="fluid" className="!py-0 h-full">
        <div className="border-t border-[#6c6c6c] w-full h-full flex items-center justify-end">
          VisualEnnode. Company Profile 2024
        </div>
      </Container>
    </footer>
  );
}
