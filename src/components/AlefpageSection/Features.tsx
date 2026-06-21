import { ExploreTemplates } from "~/components/AlefpageSection/ExploreTemplates";
import Illustration from "../Illustration";

export default function Features() {
  const STEPS = [
    {
      title: "Find your template",
      text: "Every template is embedded within an iframe, so you can easily check what they look like and test the responsive behaviour.",
    },
    {
      title: "Copy the code",
      text: "Click the code tab to see the actual source code of the template. Copy and paste it into your project and adjust it to your needs.",
    },
    {
      title: "Enjoy your free time",
      text: "You've just saved yourself a bunch of time not building the same stuff over and over again. Enjoy your free time, and build business features",
    },
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-900 h-full bg-gradient-to-t from-black/90 to-purple-600">
      <div className="max-w-8xl mx-auto py-2 sm:py-3 lg:py-4">
        <div className="w-full flex justify-center items-center p-8">
          <Illustration className="h-80 lg:h-96" />
        </div>

        <h3 className="text-2xl font-bold text-center mb-14 sm:mb-16 text-orange-500">
          Features
        </h3>

        <div className="flex flex-col md:flex-row justify-between items-center md:items-start">
          {STEPS.map((step, index) => (
            <div
              key={step.title}
              className="text-left md:text-center items-start md:items-center flex flex-col gap-4 max-w-full md:max-w-xs mt-10 md:mt-0 first:mt-0 px-4"
            >
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 font-bold flex items-center justify-center text-sm rounded-md">
                0{index + 1}
              </div>
              <p className="font-heading text-xl text-gray-700 dark:text-white">
                {step.title}
              </p>
              <p className="text-gray-500">{step.text}</p>
            </div>
          ))}
        </div>

        <ExploreTemplates templatesCount={3} />
      </div>
    </div>
  );
}
