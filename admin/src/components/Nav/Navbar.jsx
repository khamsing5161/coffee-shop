import React from 'react'
import './Nav.css'

function Navbar() {
    return (
        <header class="absolute inset-x-0 top-0 z-50">
            <nav aria-label="Global" class="flex items-center justify-between p-6 lg:px-8">
                <div class="flex lg:flex-1">
                    <a href="#" class="-m-1.5 p-1.5">
                        <span class="sr-only">Your Company</span>
                        <img src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600" alt="" class="h-8 w-auto" />
                    </a>
                </div>
                <div class="flex lg:hidden">
                    <button type="button" command="show-modal" commandfor="mobile-menu" class="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700">
                        <span class="sr-only">Open main menu</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" data-slot="icon" aria-hidden="true" class="size-6">
                            <path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </button>
                </div>
                <div class="hidden lg:flex lg:gap-x-12">
                    <a href="/dashboard" class="text-sm/6 font-semibold text-[#FFF9E9]">Dashboard</a>
                    <a href="/manage-products" class="text-sm/6 font-semibold text-[#FFF9E9]">ຈັດການສິນຄ້າ</a>
                    <a href="/manage-orders" class="text-sm/6 font-semibold text-[#FFF9E9]">ກວດສອບອໍເດີ</a>
                    <a href="#" class="text-sm/6 font-semibold text-[#FFF9E9]">ສະຕ໋ອກວັດຖຸດິບ</a>
                    <a href="#" class="text-sm/6 font-semibold text-[#FFF9E9]">ຈັດການສະມາຊິກ</a>
                    <a href="/sales-report" class="text-sm/6 font-semibold text-[#FFF9E9]">ຈັດການສະມາຊິກ</a>

                </div>
                <div class="hidden lg:flex lg:flex-1 lg:justify-end">
                    <a href="#" class="text-sm/6 font-semibold text-gray-900">Log in <span aria-hidden="true">&rarr;</span></a>
                </div>
            </nav>

        </header>



    )
}

export default Navbar