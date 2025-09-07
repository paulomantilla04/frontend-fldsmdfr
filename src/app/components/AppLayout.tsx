"use client";

import React, { useState } from "react";
import {
    Sidebar,
    SidebarBody,
    SidebarLink
} from '@/components/ui/sidebar';
import {
    Ticket,
    Download,
    Clipboard,
    UserRound,
} from 'lucide-react';

import Image from 'next/image';
import { montserrat } from "../fonts";


interface AppLayoutProps {
    children: React.ReactNode;
}


export default function AppLayout({ children }: AppLayoutProps) {

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const links = [
        {
            label: 'Administrar Tickets',
            href: '/tickets',
            icon: <Ticket className="w-5 h-5 text-black flex-shrink-0" />
        },
        {
            label: 'Reportes',
            href: '/reports',
            icon: <Clipboard className="w-5 h-5 text-black flex-shrink-0" />
        },
        {
            label: 'Descargas',
            href: '/downloads',
            icon: <Download className="w-5 h-5 text-black flex-shrink-0" />
        },
        {
            label: 'Perfil',
            href: '/profile',
            icon: <UserRound className="w-5 h-5 text-black flex-shrink-0" />
        },
    ]

    return (
        <div className="rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1 mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden min-h-screen">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
          <SidebarBody className="justify-between gap-10 ${montserrat.className}">
            <div className={`flex flex-col flex-1 overflow-y-auto overflow-x-hidden ${montserrat.className}`}>
              
              {sidebarOpen ? <Logo /> : <LogoIcon />}
              
              
              <div className="mt-8 flex flex-col gap-2">
                {links.map((link, idx) => (
                  <SidebarLink key={idx} link={link} />
                ))}
              </div>
            </div>
            
            <div className={`${montserrat.className}`}>
              <SidebarLink
                link={{
                  label: "Paulo Mantilla",
                  href: "/profile",
                  icon: (
                    <Image
                      src="/user.jpg"
                      className="h-7 w-7 flex-shrink-0 rounded-full flex items-center justify-center"
                      priority
                      alt="Avatar"
                      width={40}
                      height={40}
                    />
                  ),
                }}
              />
            </div>
          </SidebarBody>
        </Sidebar>
  

        <div className="flex flex-1">
          <div className={`p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full ${montserrat.className}`}>
            {children}
          </div>
        </div>
      </div>
    )
}

const Logo = () => {
    return (
      <div className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20">
        <Image src="/logo2.svg" alt="Logo" width={50} height={50} priority/>
        <span className={`font-black text-black dark:text-white whitespace-pre ${montserrat.className}`}>
          FLDSMDFR
        </span>
      </div>
    );
  };
  
  const LogoIcon = () => {
    return (
      <div className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20">
        <Image src="/logo2.svg" alt="Logo" width={50} height={50} priority/>
      </div>
    );
  };
  
