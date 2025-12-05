import * as Scrollytelling from "~/lib/scrollytelling-client";
import s from "./horizontal-marquee.module.scss";
import { forwardRef } from "react";

// const phrase = "OUR WOR IS SERIOUS WE ARE NOT";
const phrase = "MOUNT ADVERTISING...";
const splitted = phrase.split("");
const charsLength = splitted.length;

export const HorizontalMarquee = () => {
  return (
    <Scrollytelling.Root
      start="top top+=300px"
      debug={{ label: "Horizontal Marquee" }}
    >
      <section className={s.section}>
        <div className={s.pinned}>
          <Scrollytelling.Animation
            tween={{
              start: 0,
              end: 90,
              from: { xPercent: 98, ease: "linear" },
            }}
          >
            <div className={s.animated}>
              <Scrollytelling.Animation
                tween={{
                  start: 90,
                  end: 100,
                  to: { x: "-=50vw", ease: "linear" },
                }}
              >
                <p>
                  {splitted.map((ch, i) => {
                    const charDuration = 90 / charsLength;
                    const charStart = charDuration * i;
                    const charEnd = charStart + charDuration;

                    return (
                      <Scrollytelling.Animation
                        key={i}
                        tween={{
                          start: charStart * 0.7, // make it start a bit sooner, actually
                          end: charEnd,
                          fromTo: [
                            {
                              yPercent: 40,
                              scale: 0.5,
                              autoAlpha: 0,
                              transformOrigin: "center right",
                            },
                            {
                              keyframes: {
                                "0%": { autoAlpha: 0, scale: 0.5 },
                                "50%": { autoAlpha: 1, scale: 1 },
                                "100%": { yPercent: 0 },
                                easeEach: "linear",
                              },
                              ease: "linear",
                            },
                          ],
                        }}
                      >
                        <span
                          data-character
                          style={{
                            display: "inline-block",
                          }}
                        >
                          {ch === " " ? <>&nbsp;</> : ch}
                        </span>
                      </Scrollytelling.Animation>
                    );
                  })}
                </p>
              </Scrollytelling.Animation>
              <Scrollytelling.Animation
                tween={{
                  start: 90,
                  end: 100,
                  fromTo: [
                    { scale: 0.95, opacity: 0 },
                    { scale: 1.2, opacity: 1, ease: "linear" },
                  ],
                }}
              >
                <WorldSvg />
              </Scrollytelling.Animation>
            </div>
          </Scrollytelling.Animation>
        </div>
      </section>
    </Scrollytelling.Root>
  );
};

const WorldSvg = forwardRef<SVGSVGElement>((_, ref) => {
  return (
    <svg
      viewBox="0 0 1024 576"
      xmlns="http://www.w3.org/2000/svg"
      className={s.worldSvg}
      ref={ref}
    >
      <path
        fill="#fff"
        opacity="1"
        stroke="none"
        d="
M638.355225,222.582764 
  C640.804810,223.918701 640.239014,225.941406 640.240662,227.676315 
  C640.279602,268.665894 640.232666,309.655609 640.348328,350.644897 
  C640.359680,354.658478 638.745667,355.923035 635.045715,355.896881 
  C601.392761,355.658783 567.739563,356.154114 534.084106,355.586273 
  C515.780334,355.277466 497.463470,355.817566 479.152252,355.857239 
  C450.326355,355.919678 421.500244,355.890015 392.674225,355.882843 
  C386.158844,355.881256 385.830231,355.552185 385.827454,349.186005 
  C385.810089,309.196167 385.800568,269.206299 385.798492,229.216461 
  C385.798157,222.670273 385.821411,222.691956 392.554108,222.579895 
  C450.696045,221.612274 508.838074,223.012146 566.979980,222.568008 
  C588.636047,222.402588 610.292236,222.262604 631.948547,222.140900 
  C633.939697,222.129715 635.931946,222.336380 638.355225,222.582764 
M517.147583,267.583374 
  C508.376587,282.984100 499.605591,298.384827 490.651459,314.107117 
  C491.915253,314.524963 492.506073,314.889374 493.097900,314.891022 
  C505.077576,314.924408 517.057434,314.892365 529.037109,314.933929 
  C531.830750,314.943634 533.153870,313.168854 534.344299,311.068726 
  C538.117493,304.412323 541.790710,297.694672 545.753296,291.152496 
  C547.289917,288.615540 546.982056,286.746399 545.502808,284.351532 
  C540.171082,275.719788 535.083862,266.937439 529.832214,258.255554 
  C528.838135,256.612152 528.257019,254.545837 525.805054,253.610901 
  C522.282043,257.540588 520.361938,262.548920 517.147583,267.583374 
M467.996033,314.934814 
  C472.319733,314.932343 476.645477,314.848419 480.966339,314.957794 
  C483.589813,315.024170 485.287445,314.013702 486.607208,311.723419 
  C493.413391,299.912018 500.338257,288.169037 507.182892,276.379669 
  C507.910675,275.126068 509.077362,273.746155 508.169952,272.226776 
  C505.218323,267.284485 502.128113,262.424927 498.953125,257.310944 
  C497.848846,258.181122 497.185211,258.476257 496.868500,258.986603 
  C486.089233,276.359558 475.332489,293.746521 464.601624,311.149414 
  C462.754456,314.145111 464.359924,314.981262 467.996033,314.934814 
M544.779480,303.220917 
  C543.155762,306.873413 540.321472,310.015015 539.424011,314.908020 
  C547.868713,314.700623 555.637634,315.728821 564.424744,314.048035 
  C559.580261,306.704895 555.295593,300.210327 550.556396,293.026794 
  C548.386536,296.879181 546.776062,299.738373 544.779480,303.220917 
z"
      />
    </svg>
  );
});
