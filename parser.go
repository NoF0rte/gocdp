package gocdp

import "regexp"

type Parser interface {
	Parse(input string) (CDResults, error)
	CanParse(input string) bool
}

type TrimOptions struct {
	maxResults int
	filters    []func(CDResult) bool
}

type TrimOption func(*TrimOptions)

func WithMaxResults(max int) TrimOption {
	return func(o *TrimOptions) {
		o.maxResults = max
	}
}

func WithFilterRedirect(regexes ...string) TrimOption {
	return func(o *TrimOptions) {
		o.filters = append(o.filters, func(c CDResult) bool {
			for _, re := range regexes {
				match, _ := regexp.MatchString(re, c.Redirect)
				if match {
					return true
				}
			}

			return false
		})
	}
}

func WithFilterURL(regexes ...string) TrimOption {
	return func(o *TrimOptions) {
		o.filters = append(o.filters, func(c CDResult) bool {
			for _, re := range regexes {
				match, _ := regexp.MatchString(re, c.Url)
				if match {
					return true
				}
			}

			return false
		})
	}
}

func WithFilterStatus(statusCodes ...int) TrimOption {
	return func(o *TrimOptions) {
		o.filters = append(o.filters, func(c CDResult) bool {
			return c.IsStatus(statusCodes...)
		})
	}
}

type Trimmer interface {
	CanTrim(input string) bool
	Trim(input string, opts ...TrimOption) (string, error)
}
