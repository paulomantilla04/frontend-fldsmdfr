"use client";
import { Card, CardBody, CardHeader, Input, Button, CardFooter, Link, Spinner } from "@heroui/react";
import Image from "next/image";
import { UserRound, Lock, Eye, EyeClosed  } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { montserrat } from "../fonts";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handlePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            console.log("Datos de inicio de sesión:", { email, password });
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulación de llamada a API

            router.push('/tickets');

        } catch (err) {
            setError("Email o contraseña incorrectos. Por favor, intenta de nuevo.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="custom-grid-background min-h-screen flex items-center justify-center p-4">
            <Card className={`w-full max-w-lg p-4 ${montserrat.className}`}>
                <CardHeader className="flex justify-center">
                    <Image src="/logo.svg" alt="Logo" width={250} height={250} className="w-full max-w-[300px] h-auto" priority/>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardBody className="gap-4 text-center">
                        <div className="flex flex-col mb-4">
                            <h2 className="text-black dark:text-white font-bold text-2xl">¡Bienvenido!</h2>
                            <p className="text-gray-500 dark:text-gray-400">Inicia sesión para continuar</p>
                        </div>
                        <Input 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            label="Email" 
                            labelPlacement="outside"
                            type="email"
                            placeholder="usuario@ejemplo.com"
                            variant="faded" 
                            startContent={<UserRound className="text-gray-500"/>}
                            isRequired
                        />
                        <Input 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            label="Contraseña" 
                            labelPlacement="outside"
                            type={isPasswordVisible ? "text" : "password"}
                            placeholder="●●●●●●●●"
                            variant="faded" 
                            startContent={<Lock className="text-gray-500"/>}
                            endContent={
                                <button type="button" onClick={handlePasswordVisibility} className="focus:outline-none">
                                    {isPasswordVisible ? <EyeClosed className="text-gray-500"/> : <Eye className="text-gray-500"/>}
                                </button>
                            }
                            isRequired
                        />
                        
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    </CardBody>
                    <CardFooter className="flex flex-col items-center mt-10">    
                        <Button 
                            type="submit"
                            className="rounded-xl bg-[#0e35bf] text-white w-full" 
                            disabled={email === "" || password === "" || isLoading}
                        >
                            {isLoading ? <Spinner color="white" size="sm"/> : "Iniciar sesión"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </main>
    )
}