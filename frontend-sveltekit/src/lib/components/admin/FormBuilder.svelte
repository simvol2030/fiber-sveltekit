<script lang="ts">
	export interface FormField {
		name: string;
		label: string;
		type:
			| 'text'
			| 'email'
			| 'password'
			| 'number'
			| 'textarea'
			| 'select'
			| 'checkbox'
			| 'date';
		required?: boolean;
		placeholder?: string;
		options?: { value: string; label: string }[];
		validation?: {
			min?: number;
			max?: number;
			minLength?: number;
			maxLength?: number;
			pattern?: string;
			message?: string;
		};
		disabled?: boolean;
		hint?: string;
	}

	interface Props {
		schema: FormField[];
		initialData?: Record<string, unknown>;
		submitLabel?: string;
		cancelLabel?: string;
		loading?: boolean;
		onSubmit: (data: Record<string, unknown>) => void;
		onCancel?: () => void;
	}

	let {
		schema,
		initialData = {},
		submitLabel = 'Submit',
		cancelLabel = 'Cancel',
		loading = false,
		onSubmit,
		onCancel
	}: Props = $props();

	let formData = $state<Record<string, unknown>>({ ...initialData });
	let errors = $state<Record<string, string>>({});
	let touched = $state<Record<string, boolean>>({});

	// Initialize form data with defaults
	$effect(() => {
		schema.forEach((field) => {
			if (formData[field.name] === undefined) {
				if (field.type === 'checkbox') {
					formData[field.name] = false;
				} else if (field.type === 'number') {
					formData[field.name] = '';
				} else {
					formData[field.name] = '';
				}
			}
		});
	});

	function validateField(field: FormField, value: unknown): string {
		const strValue = String(value ?? '');

		if (field.required && !value && value !== false && value !== 0) {
			return `${field.label} is required`;
		}

		if (!value && value !== false && value !== 0) return '';

		if (field.validation) {
			const v = field.validation;

			if (v.minLength && strValue.length < v.minLength) {
				return v.message || `${field.label} must be at least ${v.minLength} characters`;
			}

			if (v.maxLength && strValue.length > v.maxLength) {
				return v.message || `${field.label} must be at most ${v.maxLength} characters`;
			}

			if (field.type === 'number') {
				const numValue = Number(value);
				if (v.min !== undefined && numValue < v.min) {
					return v.message || `${field.label} must be at least ${v.min}`;
				}
				if (v.max !== undefined && numValue > v.max) {
					return v.message || `${field.label} must be at most ${v.max}`;
				}
			}

			if (v.pattern) {
				const regex = new RegExp(v.pattern);
				if (!regex.test(strValue)) {
					return v.message || `${field.label} format is invalid`;
				}
			}
		}

		if (field.type === 'email' && strValue) {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(strValue)) {
				return 'Please enter a valid email address';
			}
		}

		return '';
	}

	function handleBlur(field: FormField) {
		touched[field.name] = true;
		const error = validateField(field, formData[field.name]);
		errors[field.name] = error;
	}

	function handleInput(field: FormField, event: Event) {
		const target = event.target as HTMLInputElement;

		if (field.type === 'checkbox') {
			formData[field.name] = target.checked;
		} else if (field.type === 'number') {
			formData[field.name] = target.value ? Number(target.value) : '';
		} else {
			formData[field.name] = target.value;
		}

		if (touched[field.name]) {
			errors[field.name] = validateField(field, formData[field.name]);
		}
	}

	function handleSubmit(event: Event) {
		event.preventDefault();

		// Validate all fields
		let hasErrors = false;
		schema.forEach((field) => {
			touched[field.name] = true;
			const error = validateField(field, formData[field.name]);
			errors[field.name] = error;
			if (error) hasErrors = true;
		});

		if (!hasErrors) {
			onSubmit(formData);
		}
	}
</script>

<form class="form-builder" onsubmit={handleSubmit}>
	{#each schema as field}
		<div class="form-field" class:has-error={touched[field.name] && errors[field.name]}>
			{#if field.type !== 'checkbox'}
				<label for={field.name} class="field-label">
					{field.label}
					{#if field.required}
						<span class="required">*</span>
					{/if}
				</label>
			{/if}

			{#if field.type === 'textarea'}
				<textarea
					id={field.name}
					name={field.name}
					placeholder={field.placeholder}
					disabled={field.disabled || loading}
					value={String(formData[field.name] ?? '')}
					oninput={(e) => handleInput(field, e)}
					onblur={() => handleBlur(field)}
					class="field-input"
					rows="4"
				></textarea>
			{:else if field.type === 'select'}
				<select
					id={field.name}
					name={field.name}
					disabled={field.disabled || loading}
					value={String(formData[field.name] ?? '')}
					onchange={(e) => handleInput(field, e)}
					onblur={() => handleBlur(field)}
					class="field-input"
				>
					<option value="">{field.placeholder || 'Select...'}</option>
					{#each field.options || [] as option}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
			{:else if field.type === 'checkbox'}
				<label class="checkbox-label">
					<input
						type="checkbox"
						id={field.name}
						name={field.name}
						disabled={field.disabled || loading}
						checked={Boolean(formData[field.name])}
						onchange={(e) => handleInput(field, e)}
						onblur={() => handleBlur(field)}
					/>
					<span class="checkbox-text">{field.label}</span>
					{#if field.required}
						<span class="required">*</span>
					{/if}
				</label>
			{:else}
				<input
					type={field.type}
					id={field.name}
					name={field.name}
					placeholder={field.placeholder}
					disabled={field.disabled || loading}
					value={formData[field.name] ?? ''}
					oninput={(e) => handleInput(field, e)}
					onblur={() => handleBlur(field)}
					class="field-input"
					min={field.validation?.min}
					max={field.validation?.max}
				/>
			{/if}

			{#if field.hint && !errors[field.name]}
				<span class="field-hint">{field.hint}</span>
			{/if}

			{#if touched[field.name] && errors[field.name]}
				<span class="field-error">{errors[field.name]}</span>
			{/if}
		</div>
	{/each}

	<div class="form-actions">
		{#if onCancel}
			<button type="button" class="btn-cancel" onclick={onCancel} disabled={loading}>
				{cancelLabel}
			</button>
		{/if}
		<button type="submit" class="btn-submit" disabled={loading}>
			{#if loading}
				<span class="spinner"></span>
			{/if}
			{submitLabel}
		</button>
	</div>
</form>

<style>
	.form-builder {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.form-field {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.field-label {
		font-weight: 500;
		color: var(--color-text);
		font-size: 0.875rem;
	}

	.required {
		color: var(--color-error);
		margin-left: 0.25rem;
	}

	.field-input {
		padding: 0.75rem 1rem;
		border: 1px solid var(--admin-card-border);
		border-radius: 8px;
		background: var(--admin-card-bg);
		color: var(--color-text);
		font-size: 0.875rem;
		transition: border-color 0.2s, box-shadow 0.2s;
	}

	.field-input:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.field-input:disabled {
		background: var(--color-bg-secondary);
		cursor: not-allowed;
		opacity: 0.7;
	}

	.field-input::placeholder {
		color: var(--color-text-secondary);
	}

	textarea.field-input {
		resize: vertical;
		min-height: 100px;
	}

	select.field-input {
		cursor: pointer;
	}

	.has-error .field-input {
		border-color: var(--color-error);
	}

	.has-error .field-input:focus {
		box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
	}

	.field-hint {
		font-size: 0.75rem;
		color: var(--color-text-secondary);
	}

	.field-error {
		font-size: 0.75rem;
		color: var(--color-error);
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
	}

	.checkbox-label input[type='checkbox'] {
		width: 18px;
		height: 18px;
		cursor: pointer;
	}

	.checkbox-text {
		font-weight: 500;
		color: var(--color-text);
		font-size: 0.875rem;
	}

	.form-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
		margin-top: 0.5rem;
		padding-top: 1rem;
		border-top: 1px solid var(--admin-card-border);
	}

	.btn-cancel,
	.btn-submit {
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.2s, transform 0.1s;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.btn-cancel {
		background: var(--color-bg-secondary);
		border: 1px solid var(--admin-card-border);
		color: var(--color-text);
	}

	.btn-cancel:hover:not(:disabled) {
		background: var(--admin-table-row-hover);
	}

	.btn-submit {
		background: var(--color-primary);
		border: none;
		color: white;
	}

	.btn-submit:hover:not(:disabled) {
		background: var(--color-primary-hover);
	}

	.btn-cancel:disabled,
	.btn-submit:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.btn-cancel:active:not(:disabled),
	.btn-submit:active:not(:disabled) {
		transform: scale(0.98);
	}

	.spinner {
		width: 16px;
		height: 16px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
