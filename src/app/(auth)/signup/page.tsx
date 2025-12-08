
import { SignupForm } from "@/components/auth/signup-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";
import Link from "next/link";

export default function SignupPage() {
  const logo = PlaceHolderImages.find((img) => img.id === "estores-logo");

  return (
    <>
      <div className="hidden items-center justify-center bg-gray-100/50 p-10 dark:bg-zinc-900/50 lg:flex" style={{ background: 'linear-gradient(to bottom, hsl(var(--background)), #FAFAFA)' }}>
        <div className="flex flex-col items-center text-center">
            {logo && (
            <Image
                src={logo.imageUrl}
                alt={logo.description}
                width={400}
                height={107}
                data-ai-hint={logo.imageHint}
                className="object-contain"
            />
            )}
            <h1 className="mt-6 text-3xl font-bold text-primary">
                Join eStores WorkHub
            </h1>
            <p className="mt-2 text-muted-foreground">
                Create an account to access the workforce management portal.
            </p>
        </div>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8">
            <div className="lg:hidden flex justify-center">
                {logo && (
                    <Image
                        src={logo.imageUrl}
                        alt={logo.description}
                        width={250}
                        height={67}
                        data-ai-hint={logo.imageHint}
                        className="object-contain"
                    />
                )}
            </div>
            <Card>
                <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold tracking-tight text-primary">
                    Create an Account
                </CardTitle>
                <CardDescription>
                    Enter your details to join eStores WorkHub
                </CardDescription>
                </CardHeader>
                <CardContent>
                <SignupForm />
                </CardContent>
            </Card>
             <div className="text-center text-sm">
                Already have an account?{' '}
                <Link href="/login" className="underline hover:text-primary">
                    Sign in here
                </Link>
            </div>
        </div>
      </div>
    </>
  );
}
