package gocdp

import (
	"regexp"
	"strings"
)

type TrimOperator int

const (
	OrOperator TrimOperator = iota
	AndOperator
)

type Parser interface {
	Parse(input string) (CDResults, error)
	CanParse(input string) bool
	CanTransform() bool
	Transform(input string, filtered []interface{}) (string, error)
}

type TrimOptions struct {
	maxResults int
	filters    []func(CDResult) bool
	operator   TrimOperator
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

func WithFilterContentType(contentTypes ...string) TrimOption {
	return func(o *TrimOptions) {
		o.filters = append(o.filters, func(c CDResult) bool {
			for _, contentType := range contentTypes {
				if strings.EqualFold(c.ContentType, contentType) {
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

func WithFilterLength(lengths ...int) TrimOption {
	return func(o *TrimOptions) {
		o.filters = append(o.filters, func(c CDResult) bool {
			for _, length := range lengths {
				if c.ContentLength == length {
					return true
				}
			}
			return false
		})
	}
}

func WithFilterOperator(op TrimOperator) TrimOption {
	return func(o *TrimOptions) {
		o.operator = op
	}
}
