"use client";
import { Card, CardBody, CardHeader, Input, Button, CardFooter, Link, Spinner } from "@heroui/react";
import Image from "next/image";
import { UserRound, Lock, Eye, EyeClosed, Mail, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { montserrat } from "../fonts";
import { motion, useInView, Variants} from 'framer-motion';
import { useAuth } from "@/hooks/useAuth";

export default function Register() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
    const router = useRouter();
    const { register, isAuthenticated, loading: authLoading } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

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

    const handleConfirmPasswordVisibility = () => {
        setIsConfirmPasswordVisible(!isConfirmPasswordVisible);
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setSuccess(false);

        // Validaciones
        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden");
            setIsLoading(false);
            return;
        }

        if (password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres");
            setIsLoading(false);
            return;
        }

        try {
            await register({
                first_name: firstName,
                last_name: lastName,
                email,
                username,
                password,
            });
            
            setSuccess(true);

            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || "Error al registrar usuario. Por favor, intenta de nuevo.";
            setError(errorMessage);
            console.error("Error en registro:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.main ref={ref} variants={staggerContainer} initial="hidden" animate={isInView ? "visible" : "hidden"} className="custom-grid-background min-h-screen flex items-center justify-center p-4">
            <Card className={`w-full max-w-2xl p-4 ${montserrat.className}`}>
                <CardHeader className="flex justify-center">
                    <motion.div variants={staggerItemXPositive}>
                        <Image src="/logo.svg" alt="Logo" width={250} height={250} className="w-full max-w-[250px] h-auto" priority/>
                    </motion.div>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardBody className="space-y-4 text-center overflow-hidden">
                        <motion.div className="flex flex-col mb-4 overflow-hidden">
                            <motion.h2 variants={staggerItemXPositive} className="text-black dark:text-white font-bold text-2xl">¡Crea tu cuenta!</motion.h2>
                            <motion.p variants={staggerItemXNegative} className="text-gray-500 dark:text-gray-400">Completa tus datos para registrarte</motion.p>
                        </motion.div>

                        {/* Nombres en grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <motion.div variants={staggerItemXNegative}>
                                <Input 
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    label="Nombre" 
                                    labelPlacement="outside"
                                    type="text"
                                    placeholder="Juan"
                                    variant="faded" 
                                    startContent={<User className="text-gray-500"/>}
                                    isRequired
                                />
                            </motion.div>
                            <motion.div variants={staggerItemXPositive}>
                                <Input 
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    label="Apellido" 
                                    labelPlacement="outside"
                                    type="text"
                                    placeholder="Pérez"
                                    variant="faded" 
                                    startContent={<User className="text-gray-500"/>}
                                    isRequired
                                />
                            </motion.div>
                        </div>

                        {/* Email y Username */}
                        <motion.div variants={staggerItemXPositive}>
                            <Input 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                label="Email" 
                                labelPlacement="outside"
                                type="email"
                                placeholder="usuario@ejemplo.com"
                                variant="faded" 
                                startContent={<Mail className="text-gray-500"/>}
                                isRequired
                            />
                        </motion.div>

                        <motion.div variants={staggerItemXNegative}>
                            <Input 
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                label="Nombre de usuario" 
                                labelPlacement="outside"
                                type="text"
                                placeholder="juanperez"
                                variant="faded" 
                                startContent={<UserRound className="text-gray-500"/>}
                                isRequired
                            />
                        </motion.div>

                        {/* Contraseñas */}
                        <motion.div variants={staggerItemXPositive}>
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

                        <motion.div variants={staggerItemXNegative}>
                            <Input 
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                label="Confirmar contraseña" 
                                labelPlacement="outside"
                                type={isConfirmPasswordVisible ? "text" : "password"}
                                placeholder="●●●●●●●●"
                                variant="faded" 
                                startContent={<Lock className="text-gray-500"/>}
                                endContent={
                                    <button type="button" onClick={handleConfirmPasswordVisibility} className="focus:outline-none">
                                        {isConfirmPasswordVisible ? <EyeClosed className="text-gray-500"/> : <Eye className="text-gray-500"/>}
                                    </button>
                                }
                                isRequired
                            />
                        </motion.div>

                        {/* Mensajes de error y éxito */}
                        {error && (
                            <motion.p variants={staggerItemXNegative} className="text-red-500 text-sm text-center bg-red-500/10 p-2 rounded-md">
                                {error}
                            </motion.p>
                        )}

                        {success && (
                            <motion.p variants={staggerItemXPositive} className="text-green-500 text-sm text-center bg-green-500/10 p-2 rounded-md">
                                ¡Registro exitoso! Redirigiendo al login...
                            </motion.p>
                        )}

                    </CardBody>
                    <CardFooter className="flex flex-col items-center mt-4 overflow-hidden space-y-3">
                        <motion.div variants={staggerItemYPositive} className="w-full">
                            <Button 
                                type="submit"
                                className="rounded-xl bg-[#0e35bf] text-white w-full" 
                                disabled={
                                    firstName === "" || 
                                    lastName === "" || 
                                    email === "" || 
                                    username === "" || 
                                    password === "" || 
                                    confirmPassword === "" || 
                                    isLoading
                                }
                            >
                                {isLoading ? <Spinner color="white" size="sm"/> : "Registrarse"}
                            </Button>
                        </motion.div>
                        <motion.div variants={staggerItemYPositive} className="text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                ¿Ya tienes cuenta?{" "}
                                <Link href="/login" className="text-[#0e35bf] font-semibold hover:underline">
                                    Iniciar sesión
                                </Link>
                            </p>
                        </motion.div>
                    </CardFooter>
                </form>
            </Card>
        </motion.main>
    )
}
