export function isDemoTourEnabled(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_TOUR === "1";
}
