import Image from "next/image";

export function OrangeMoneyLogo({ className }: { className?: string }) {
  return (
    <Image
      src="/payments/orange-money.png"
      alt="Orange Money"
      width={240}
      height={160}
      className={className}
    />
  );
}

export function MtnMoneyLogo({ className }: { className?: string }) {
  return (
    <Image
      src="/payments/mtn-momo.png"
      alt="MTN MoMo"
      width={343}
      height={160}
      className={className}
    />
  );
}

export function VisaLogo({ className }: { className?: string }) {
  return (
    <Image
      src="/payments/visa.png"
      alt="Visa"
      width={192}
      height={160}
      className={className}
    />
  );
}

/** White/reversed variants — for use on dark surfaces (e.g. the signup page's side panel). */
export function OrangeMoneyLogoWhite({ className }: { className?: string }) {
  return (
    <Image
      src="/payments/orangewhite.png"
      alt="Orange Money"
      width={300}
      height={200}
      className={className}
    />
  );
}

export function MtnMoneyLogoWhite({ className }: { className?: string }) {
  return (
    <Image
      src="/payments/mtnwhite.png"
      alt="MTN MoMo"
      width={428}
      height={200}
      className={className}
    />
  );
}

export function VisaLogoWhite({ className }: { className?: string }) {
  return (
    <Image
      src="/payments/visawhite.png"
      alt="Visa"
      width={240}
      height={200}
      className={className}
    />
  );
}
