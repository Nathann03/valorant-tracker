<script>
	import { Dialog as DialogPrimitive } from "bits-ui";
	import X from "lucide-svelte/icons/x";
	import * as Dialog from "./index.js";
	import { cn, flyAndScale } from "$lib/utils.js";
	let className = undefined;
	export let transition = flyAndScale;
	export let transitionConfig = {
		duration: 200,
	};
	export { className as class };
</script>

<Dialog.Portal>
	<!-- Dialog Overlay with dark background -->
	<Dialog.Overlay class="bg-gray-800 bg-opacity-50 fixed inset-0 z-40" />
	
	<!-- Dialog Content with dark background, red/yellow button accents -->
	<DialogPrimitive.Content
		{transition}
		{transitionConfig}
		class={cn(
			"bg-gray-900 text-white fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-gray-700 p-6 shadow-lg sm:rounded-lg md:w-full",
			className
		)}
		{...$$restProps}
	>
		<slot />
		
		<!-- Close Button with red accent -->
		<DialogPrimitive.Close
			class="ring-offset-gray-900 focus:ring-red-500 absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none"
		>
			<X class="h-4 w-4 text-white" />
			<span class="sr-only">Close</span>
		</DialogPrimitive.Close>
	</DialogPrimitive.Content>
</Dialog.Portal>
