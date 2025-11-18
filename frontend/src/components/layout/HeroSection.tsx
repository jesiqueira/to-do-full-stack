export const HeroSection = () => (
  <div className="text-center lg:text-left lg:w-1/2 mb-12 lg:mb-0">
    <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
      TaskFlow App
    </h1>
    <p className="mt-6 text-lg leading-8 text-gray-300">Organize sua vida, crie, gerencie e acompanhe suas tarefas em tempo real.</p>
    <ul className="mt-8 text-left space-y-3 text-gray-400 inline-block lg:block">
      <li className="flex items-center">
        <span className="text-blue-400 mr-2 font-bold">✓</span> Título e Descrição Completos
      </li>
      <li className="flex items-center">
        <span className="text-blue-400 mr-2 font-bold">✓</span> Status de Progresso Flexível
      </li>
      <li className="flex items-center">
        <span className="text-blue-400 mr-2 font-bold">✓</span> Dados Salvos e Sincronizados em Nuvem
      </li>
    </ul>
  </div>
)
