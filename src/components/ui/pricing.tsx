'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Check, Crown, Sparkles, Zap } from 'lucide-react';
import { motion, Transition } from 'framer-motion';

type FREQUENCY = 'monthly' | 'yearly';
const frequencies: FREQUENCY[] = ['monthly', 'yearly'];

interface Plan {
	name: string;
	info: string;
	price: {
		monthly: number;
		yearly: number;
	};
	features: {
		text: string;
		tooltip?: string;
	}[];
	btn: {
		text: string;
		onClick?: () => void;
		variant?: 'default' | 'outline';
		disabled?: boolean;
	};
	highlighted?: boolean;
	isCurrentPlan?: boolean;
}

interface PricingSectionProps extends React.ComponentProps<'div'> {
	plans: Plan[];
	heading: string;
	description?: string;
}

export function PricingSection({
	plans,
	heading,
	description,
	...props
}: PricingSectionProps) {
	const [frequency, setFrequency] = React.useState<'monthly' | 'yearly'>(
		'monthly',
	);

	return (
		<div
			className={cn(
				'flex w-full flex-col items-center justify-center space-y-8',
				props.className,
			)}
			{...props}
		>
			<motion.div 
				className="mx-auto max-w-2xl space-y-4 text-center"
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
			>
				<h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
					{heading}
				</h2>
				{description && (
					<p className="text-muted-foreground text-base md:text-lg max-w-lg mx-auto">
						{description}
					</p>
				)}
			</motion.div>
			
			<motion.div
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.4, delay: 0.1 }}
			>
				<PricingFrequencyToggle
					frequency={frequency}
					setFrequency={setFrequency}
				/>
			</motion.div>
			
			<div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 px-4">
				{plans.map((plan, index) => (
					<motion.div
						key={plan.name}
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
					>
						<PricingCard plan={plan} frequency={frequency} />
					</motion.div>
				))}
			</div>
		</div>
	);
}

type PricingFrequencyToggleProps = React.ComponentProps<'div'> & {
	frequency: FREQUENCY;
	setFrequency: React.Dispatch<React.SetStateAction<FREQUENCY>>;
};

export function PricingFrequencyToggle({
	frequency,
	setFrequency,
	...props
}: PricingFrequencyToggleProps) {
	return (
		<div
			className={cn(
				'mx-auto flex w-fit rounded-2xl p-1.5 glass-premium',
				props.className,
			)}
			{...props}
		>
			{frequencies.map((freq) => (
				<button
					key={freq}
					onClick={() => setFrequency(freq)}
					className="relative px-6 py-2.5 text-sm font-medium capitalize transition-all duration-300"
				>
					<span className={cn(
						"relative z-20 transition-colors duration-300",
						frequency === freq ? "text-white" : "text-muted-foreground hover:text-foreground"
					)}>
						{freq === 'monthly' ? 'Maandelijks' : 'Jaarlijks'}
					</span>
					{frequency === freq && (
						<motion.span
							layoutId="frequency-toggle"
							transition={{ type: 'spring', duration: 0.5, bounce: 0.2 }}
							className="absolute inset-0 z-10 rounded-xl bg-gradient-to-r from-primary to-primary/80 shadow-lg"
						/>
					)}
				</button>
			))}
		</div>
	);
}

type PricingCardProps = React.ComponentProps<'div'> & {
	plan: Plan;
	frequency?: FREQUENCY;
};

export function PricingCard({
	plan,
	className,
	frequency = frequencies[0],
	...props
}: PricingCardProps) {
	const showDiscountBadge = frequency === 'yearly' && plan.name !== 'Free' && plan.price.yearly > 0;
	const discountPercentage = showDiscountBadge ? Math.round(
		((plan.price.monthly * 12 - plan.price.yearly) /
			(plan.price.monthly * 12)) *
			100,
	) : 0;

	const getPlanIcon = () => {
		switch (plan.name) {
			case 'Free':
				return <Zap className="h-5 w-5" />;
			case 'Pro':
				return <Sparkles className="h-5 w-5" />;
			case 'Premium':
				return <Crown className="h-5 w-5" />;
			default:
				return <Zap className="h-5 w-5" />;
		}
	};

	const getGradientColors = () => {
		if (plan.highlighted) {
			return 'from-primary/20 via-primary/10 to-transparent';
		}
		if (plan.name === 'Premium') {
			return 'from-amber-500/20 via-amber-500/10 to-transparent';
		}
		return 'from-muted/50 via-muted/30 to-transparent';
	};

	const getIconGradient = () => {
		if (plan.highlighted) {
			return 'from-primary to-primary/70';
		}
		if (plan.name === 'Premium') {
			return 'from-amber-500 to-amber-600';
		}
		return 'from-muted-foreground to-muted-foreground/70';
	};

	return (
		<div
			key={plan.name}
			className={cn(
				'group relative flex h-full w-full flex-col rounded-3xl transition-all duration-500',
				plan.highlighted 
					? 'bg-gradient-to-b from-primary/5 to-background border-2 border-primary/30 shadow-xl shadow-primary/10 scale-[1.02]' 
					: plan.isCurrentPlan
						? 'bg-gradient-to-b from-green-500/5 to-background border-2 border-green-500/30'
						: 'glass-premium border border-border/50 hover:border-primary/30 hover:shadow-lg',
				className,
			)}
			{...props}
		>
			{/* Gradient overlay */}
			<div className={cn(
				'absolute inset-0 rounded-3xl bg-gradient-to-b opacity-50 pointer-events-none',
				getGradientColors()
			)} />

			{/* Animated border for highlighted */}
			{plan.highlighted && !plan.isCurrentPlan && (
				<BorderTrail
					style={{
						boxShadow: '0px 0px 60px 30px hsl(var(--primary) / 0.3)',
					}}
					size={80}
				/>
			)}

			{/* Badges */}
			<div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
				{plan.isCurrentPlan && (
					<motion.span 
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						className="bg-gradient-to-r from-green-500 to-emerald-500 text-white flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold shadow-lg"
					>
						<Check className="h-3 w-3" />
						Huidig Plan
					</motion.span>
				)}
				{plan.highlighted && !plan.isCurrentPlan && (
					<motion.span 
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold shadow-lg animate-shimmer"
					>
						<Sparkles className="h-3 w-3" />
						Populair
					</motion.span>
				)}
				{showDiscountBadge && (
					<span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold shadow-lg">
						-{discountPercentage}%
					</span>
				)}
			</div>

			{/* Header */}
			<div className="relative p-6 pt-8 pb-4">
				<div className="flex items-center gap-3 mb-3">
					<div className={cn(
						'w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br text-white shadow-lg',
						getIconGradient()
					)}>
						{getPlanIcon()}
					</div>
					<div>
						<h3 className="text-xl font-bold">{plan.name}</h3>
						<p className="text-muted-foreground text-sm">{plan.info}</p>
					</div>
				</div>
				
				<div className="mt-6 flex items-baseline gap-1">
					{plan.name === 'Free' ? (
						<span className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Gratis</span>
					) : (
						<>
							<span className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
								€{plan.price[frequency]}
							</span>
							<span className="text-muted-foreground text-sm">
								/{frequency === 'monthly' ? 'maand' : 'jaar'}
							</span>
						</>
					)}
				</div>
			</div>

			{/* Divider */}
			<div className="mx-6 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

			{/* Features */}
			<div className="relative flex-1 space-y-3 p-6">
				{plan.features.map((feature, index) => (
					<motion.div 
						key={index} 
						className="flex items-start gap-3"
						initial={{ opacity: 0, x: -10 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.3 + index * 0.05 }}
					>
						<div className={cn(
							'mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0',
							plan.highlighted 
								? 'bg-primary/20 text-primary' 
								: plan.name === 'Premium'
									? 'bg-amber-500/20 text-amber-500'
									: 'bg-muted text-muted-foreground'
						)}>
							<Check className="h-3 w-3" />
						</div>
						<TooltipProvider>
							<Tooltip delayDuration={0}>
								<TooltipTrigger asChild>
									<p className={cn(
										"text-sm text-foreground/80",
										feature.tooltip && 'cursor-pointer border-b border-dashed border-muted-foreground/30',
									)}>
										{feature.text}
									</p>
								</TooltipTrigger>
								{feature.tooltip && (
									<TooltipContent className="glass-premium">
										<p>{feature.tooltip}</p>
									</TooltipContent>
								)}
							</Tooltip>
						</TooltipProvider>
					</motion.div>
				))}
			</div>

			{/* Button */}
			<div className="relative p-6 pt-2">
				<Button
					className={cn(
						"w-full h-12 rounded-xl font-semibold text-base transition-all duration-300",
						plan.highlighted && !plan.isCurrentPlan
							? "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
							: plan.name === 'Premium' && !plan.isCurrentPlan
								? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25"
								: ""
					)}
					variant={plan.isCurrentPlan ? 'outline' : (plan.btn.variant || 'default')}
					onClick={plan.btn.onClick}
					disabled={plan.btn.disabled}
				>
					{plan.btn.text}
				</Button>
			</div>
		</div>
	);
}

type BorderTrailProps = {
  className?: string;
  size?: number;
  transition?: Transition;
  delay?: number;
  onAnimationComplete?: () => void;
  style?: React.CSSProperties;
};

export function BorderTrail({
  className,
  size = 60,
  transition,
  delay,
  onAnimationComplete,
  style,
}: BorderTrailProps) {
  const BASE_TRANSITION = {
    repeat: Infinity,
    duration: 5,
    ease: "linear" as const,
  };

  return (
    <div className='pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)]'>
      <motion.div
        className={cn('absolute aspect-square bg-primary', className)}
        style={{
          width: size,
          offsetPath: `rect(0 auto auto 0 round ${size}px)`,
          ...style,
        }}
        animate={{
          offsetDistance: ['0%', '100%'],
        }}
        transition={{
          ...(transition ?? BASE_TRANSITION),
          delay: delay,
        }}
        onAnimationComplete={onAnimationComplete}
      />
    </div>
  );
}
