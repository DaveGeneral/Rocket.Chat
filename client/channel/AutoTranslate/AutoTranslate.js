import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import React, { useMemo, useState, useEffect } from 'react';

import { useEndpointActionExperimental } from '../../hooks/useEndpointAction';
import { useEndpointData } from '../../hooks/useEndpointData';
import { useLanguage } from '../../contexts/TranslationContext';
import { useUserSubscription } from '../../contexts/UserContext';
import AutoTranslate from '../../components/basic/AutoTranslate';

export default React.memo(({ tabBar, rid }) => {
	const userLanguage = useLanguage();
	const subscription = useUserSubscription(rid);

	const { value: data } = useEndpointData(
		'autotranslate.getSupportedLanguages',
		useMemo(
			() => ({ targetLanguage: userLanguage }),
			[userLanguage],
		),
	);

	const [currentLanguage, setCurrentLanguage] = useState(subscription.autoTranslateLanguage);

	const saveSettings = useEndpointActionExperimental(
		'POST',
		'autotranslate.saveSettings',
	);

	const handleChangeLanguage = useMutableCallback((value) => {
		setCurrentLanguage(value);

		saveSettings({
			roomId: rid,
			field: 'autoTranslateLanguage',
			value,
		});
	});

	const handleSwitch = useMutableCallback((event) => {
		saveSettings({
			roomId: rid,
			field: 'autoTranslate',
			value: event.target.checked,
		});
	});

	const handleClose = useMutableCallback(() => tabBar && tabBar.close());

	useEffect(() => {
		if (!subscription.autoTranslate) {
			return;
		}

		if (!subscription.autoTranslateLanguage) {
			handleChangeLanguage(userLanguage);
		}
	}, [subscription.autoTranslate, subscription.autoTranslateLanguage, handleChangeLanguage, userLanguage]);

	return <AutoTranslate
		language={ currentLanguage }
		languages={ data ? data.languages.map((value) => [value.language, value.name]) : [] }
		handleSwitch={ handleSwitch }
		handleChangeLanguage={ handleChangeLanguage }
		translateEnable={ !!subscription.autoTranslate }
		handleClose={ handleClose }
	/>;
});
