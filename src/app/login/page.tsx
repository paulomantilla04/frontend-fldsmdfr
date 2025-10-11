"use client";
import { Card, CardBody, CardHeader, Input, Button, CardFooter, Link, Spinner } from "@heroui/react";
import Image from "next/image";
import { UserRound, Lock, Eye, EyeClosed  } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { montserrat } from "../fonts";
import { motion, useInView, Variants} from 'framer-motion';
import { useAuth } from "@/hooks/useAuth";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const router = useRouter();
    const { login, isAuthenticated, loading: authLoading, error: authError } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Redirigir si ya está autenticado
    useEffect(() => {
        if (isAuthenticated()) {
            router.push('/dashboard');
        }
    }, [isAuthenticated, router]);

    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const staggerContainer: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1,
            }
        }
    } 

    const staggerItemXPositive: Variants = {
        hidden: { opacity: 0, x: 30 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.5,
                ease: [0.25, 0.1, 0.25, 1],
            }
        }
    };

    const staggerItemXNegative: Variants = {
        hidden: { opacity: 0, x: -30 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.5,
                ease: [0.25, 0.1, 0.25, 1],
            }
        }
    }

    const staggerItemYPositive: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: [0.25, 0.1, 0.25, 1],
            }
        }
    }

    const handlePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            await login({ username, password });

            router.push('/dashboard');
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || "Usuario o contraseña incorrectos. Por favor, intenta de nuevo.";
            setError(errorMessage);
            console.error("Error en login:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.main ref={ref} variants={staggerContainer} initial="hidden" animate={isInView ? "visible" : "hidden"} className="custom-grid-background min-h-screen flex items-center justify-center p-4">
            <Card className={`w-full max-w-lg p-4 ${montserrat.className}`}>
                <CardHeader className="flex justify-center">
                    <motion.div variants={staggerItemXPositive}>
                        <Image src="/logo.svg" alt="Logo" width={250} height={250} className="w-full max-w-[300px] h-auto" priority/>
                    </motion.div>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardBody className="space-y-4 text-center overflow-hidden">
                        <motion.div className="flex flex-col mb-4 overflow-hidden">
                            <motion.h2 variants={staggerItemXPositive} className="text-black dark:text-white font-bold text-2xl">¡Bienvenido!</motion.h2>
                            <motion.p variants={staggerItemXNegative} className="text-gray-500 dark:text-gray-400">Inicia sesión para continuar</motion.p>
                        </motion.div>
                        <motion.div variants={staggerItemXPositive}>
                            <Input 
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                label="Usuario" 
                                labelPlacement="outside"
                                type="text"
                                placeholder="tu_usuario"
                                variant="faded" 
                                startContent={<UserRound className="text-gray-500"/>}
                                isRequired
                            />
                        </motion.div>
                        <motion.div variants={staggerItemXNegative}>
                            
                        
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
                        </motion.div>
                        {error && <motion.p variants={staggerItemXNegative} className="text-red-500 text-sm text-center bg-red-500/10 p-2 rounded-md">{error}</motion.p>}

                    </CardBody>
                    <CardFooter className="flex flex-col items-center mt-10 overflow-hidden space-y-3">
                        <motion.div variants={staggerItemYPositive} className="w-full">
                            <Button 
                                type="submit"
                                className="rounded-xl bg-[#0e35bf] text-white w-full" 
                                disabled={username === "" || password === "" || isLoading}
                            >
                                {isLoading ? <Spinner color="white" size="sm"/> : "Iniciar sesión"}
                            </Button>
                        </motion.div>
                        <motion.div variants={staggerItemYPositive} className="text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                ¿No tienes cuenta?{" "}
                                <Link href="/register" className="text-[#0e35bf] font-semibold hover:underline">
                                    Regístrate aquí
                                </Link>
                            </p>
                        </motion.div>
                    </CardFooter>
                </form>
            </Card>
        </motion.main>
    )
}