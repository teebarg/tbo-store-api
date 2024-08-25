import React from "react";

interface Props {}

const Component: React.FC<Props> = () => {
    return (
        <React.Fragment>
            <div className="relative flex w-full flex-none flex-col gap-3">
                <div className="relative shadow-black/5 shadow-none rounded-large" style={{ maxWidth: "fit-content" }}>
                    <div className="relative overflow-hidden rounded-inherit rounded-large">
                        <Image isZoomed width={240} alt="NextUI Fruit Image with Zoom" src="https://nextui-docs-v2.vercel.app/images/fruit-1.jpeg" />
                        <img
                            src="https://nextuipro.nyc3.cdn.digitaloceanspaces.com/components-images/places/1.jpeg"
                            className="relative z-10 opacity-0 shadow-black/5 data-[loaded=true]:opacity-100 shadow-none object-cover transform transition-transform-opacity motion-reduce:transition-none !duration-300 rounded-large aspect-square w-full hover:scale-110"
                            alt="Ponta do Sol, Portugal"
                            data-loaded="true"
                        />
                    </div>
                    <img
                        src="https://nextuipro.nyc3.cdn.digitaloceanspaces.com/components-images/places/1.jpeg"
                        className="absolute z-0 inset-0 w-full h-full object-cover filter blur-lg scale-105 saturate-150 opacity-30 translate-y-1 rounded-large"
                        alt="Ponta do Sol, Portugal"
                        aria-hidden="true"
                        data-loaded="true"
                    />
                </div>
                <div className="mt-1 flex flex-col gap-2 px-1">
                    <div className="flex items-start justify-between gap-1">
                        <h3 className="text-small font-medium text-default-700">Ponta do Sol, Portugal</h3>
                    </div>
                    <p className="text-small text-default-500">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                </div>
            </div>
        </React.Fragment>
    );
};

export default Component;
