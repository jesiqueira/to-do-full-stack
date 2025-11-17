// src/components/ui/Divider/Divider.tsx

export const Divider = () => (
  <div className="relative my-6">
    <div className="absolute inset-0 flex items-center" aria-hidden="true">
      <div className="w-full border-t border-gray-200" />
    </div>
    <div className="relative flex justify-center text-sm">
      <span className="bg-white px-2 text-gray-500">OU</span>
    </div>
  </div>
)
